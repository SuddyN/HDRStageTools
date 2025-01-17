import JSZip from "jszip";
import * as JSYaml from "js-yaml";
import * as lodash from "lodash";
import { Lvd, LvdStats, Vec2 } from "../Types";

async function initLvdFromUrl(
  url: string,
  debug?: boolean
): Promise<Map<string, Lvd>> {
  const lvdMap = new Map<string, Lvd>();

  // load ult lvd
  const ultBlob = await getBlobFromUrl(
    "https://suddyn.github.io/HDRStageTools/lvd/ultimate/lvd.zip"
  );
  await writeLvdFromZip(ultBlob, lvdMap);

  // load new lvd on top of ult lvd
  const blob = await getBlobFromUrl(url);
  await writeLvdFromZip(blob, lvdMap);

  const mergedLvdMap = mergeLvd(lvdMap, debug ?? false);
  Array.from(mergedLvdMap.entries()).forEach((entry) => {
    calcLvdStats(entry[0], entry[1]);
  });

  return mergedLvdMap;
}

async function getBlobFromUrl(url: string): Promise<Blob> {
  return new Promise<any>(function (resolve, reject) {
    const createCORSRequest = function (method: string, url: string | URL) {
      const xhr = new XMLHttpRequest();
      if ("withCredentials" in xhr) {
        // Most browsers.
        xhr.open(method, url, true);
        xhr.responseType = "blob";
      }
      return xhr;
    };
    const method = "GET";
    const xhr = createCORSRequest(method, url);

    xhr.onload = function () {
      if (this.status >= 200 && this.status < 300) {
        resolve(xhr.response);
      } else {
        reject({
          status: this.status,
          statusText: xhr.statusText,
        });
      }
    };
    xhr.onerror = function () {
      reject({
        status: this.status,
        statusText: xhr.statusText,
      });
    };
    xhr.send();
  });
}

async function writeLvdFromZip(
  blob: Blob,
  baseMap: Map<string, Lvd>
): Promise<void> {
  const jszip = new JSZip();
  const zip = await jszip.loadAsync(blob);
  for (const file of Object.values(zip.files)) {
    if (file.dir) {
      continue;
    }
    if (LVD_BLACKLIST.includes(file.name)) {
      console.log("blacklisted", file.name);
      continue;
    }
    const stageYml = await file.async("string");

    try {
      const stageLvd = JSYaml.load(stageYml) as Lvd;
      if (
        !stageLvd.blast_zone ||
        !stageLvd.camera_boundary ||
        !stageLvd.collisions
      ) {
        throw new Error(`bad lvd for ${file.name}`);
      }

      alignLvd(stageLvd);

      baseMap.set(file.name, stageLvd);
    } catch (e) {
      console.warn(e);
    }
  }
}

function getMinSpawnLoc(lvd: Lvd) {
  let min = Number.MAX_VALUE;
  for (const spawn of lvd.spawns) {
    min = Math.min(min, spawn.pos.y);
  }
  return min;
}

function alignLvd(lvd: Lvd) {
  if (!lvd.blast_zone[0] && !lvd.camera_boundary[0]) {
    return;
  }

  const { left, right } = lvd.blast_zone[0] ?? lvd.camera_boundary[0];
  const center: Vec2 = {
    x: (left + right) / 2,
    y: getMinSpawnLoc(lvd),
  };

  lvd.collisions.forEach((collision) => {
    collision.vertices.forEach((vertex) => {
      vertex.x -= center.x;
      vertex.y -= center.y;
    });
  });
  lvd.spawns.forEach((spawn) => {
    spawn.pos.x -= center.x;
    spawn.pos.y -= center.y;
  });
  lvd.respawns.forEach((respawn) => {
    respawn.pos.x -= center.x;
    respawn.pos.y -= center.y;
  });
  lvd.camera_boundary.forEach((camera_boundary) => {
    camera_boundary.left -= center.x;
    camera_boundary.right -= center.x;
    camera_boundary.top -= center.y;
    camera_boundary.bottom -= center.y;
  });
  lvd.blast_zone.forEach((blast_zone) => {
    blast_zone.left -= center.x;
    blast_zone.right -= center.x;
    blast_zone.top -= center.y;
    blast_zone.bottom -= center.y;
  });
  lvd.item_spawners.forEach((item_spawner) => {
    item_spawner.sections.forEach((section) => {
      if (section.Path) {
        section.Path.points[0].x -= center.x;
        section.Path.points[0].y -= center.y;
        section.Path.points[1].x -= center.x;
        section.Path.points[1].y -= center.y;
      }
      if (section.Point) {
        section.Point.x -= center.x;
        section.Point.y -= center.y;
      }
    });
  });
  lvd.ptrainer_platforms.forEach((ptrainer_platform) => {
    ptrainer_platform.pos.x -= center.x;
    ptrainer_platform.pos.y -= center.y;
  });
  lvd.shrunken_camera_boundary.forEach((camera_boundary) => {
    camera_boundary.left -= center.x;
    camera_boundary.right -= center.x;
    camera_boundary.top -= center.y;
    camera_boundary.bottom -= center.y;
  });
  lvd.shrunken_blast_zone.forEach((blast_zone) => {
    blast_zone.left -= center.x;
    blast_zone.right -= center.x;
    blast_zone.top -= center.y;
    blast_zone.bottom -= center.y;
  });
}

function lvdPartExists(name: string, other: string) {
  const d = name.split("/");
  const o = other.split("/");
  for (let i = 0; i < d.length - 1; i++) {
    if (d[i] !== o[i]) {
      return false;
    }
  }
  return true;
}

function mergeStage(lvd: Lvd, other: Lvd) {
  lvd.collisions.push(...other.collisions);
}

function lvdEqual(lvd: Lvd, other: Lvd) {
  if (lodash.isEqual(lvd, other)) {
    return true;
  }
  return false;
}

function handleSimilarLvd(entry: [string, Lvd], lvdMap: Map<string, Lvd>) {
  for (const other of Array.from(lvdMap.entries())) {
    if (entry[0] === other[0]) {
      continue;
    }
    if (lvdEqual(entry[1], other[1])) {
      console.log("removed", other[0], "(equal)");
      other[1].remove = true;
      continue;
    }
    if (lvdPartExists(entry[0], other[0])) {
      if (
        MERGE_BLACKLIST.includes(entry[0]) ||
        MERGE_BLACKLIST.includes(other[0])
      ) {
        continue;
      }
      mergeStage(entry[1], other[1]);
      console.log("removed", other[0], "(merged)");
      other[1].remove = true;
    }
  }
}

function mergeLvd(lvdMap: Map<string, Lvd>, debug: boolean): Map<string, Lvd> {
  const newMap: Map<string, Lvd> = new Map<string, Lvd>();
  for (const entry of Array.from(lvdMap.entries())) {
    handleSimilarLvd(entry, lvdMap);

    if (entry[1].remove) {
      continue;
    }

    const dir = entry[0].split("/");
    const translatedName = LVD_NAME_MAP.get(dir[0]) ?? dir[0];
    const baseName = debug ? dir[0] : translatedName;
    const altNum = parseInt(dir[1].replace(/\D/g, ""));
    const fileName = dir[dir.length - 1].split(".")[0];
    const partNum = parseInt(fileName.slice(-2).replace(/\D/g, ""));
    const fullName =
      baseName +
      (isNaN(altNum) ? "" : ` (Alt ${altNum})`) +
      (isNaN(partNum) || partNum === 0 ? "" : ` (Part ${partNum + 1})`);
    newMap.set(fullName, entry[1]);
  }

  return newMap;
}

function calcLvdStats(name: string, lvd: Lvd): void {
  const stats: LvdStats = {
    name: name,
    stageWidth: 0,
    platNum: 0,

    stageMinX: Infinity,
    stageMaxX: -Infinity,
    stageMinY: Infinity,
    stageMaxY: -Infinity,

    platMinX: Infinity,
    platMaxX: -Infinity,
    platMinY: Infinity,
    platMaxY: -Infinity,
    platLengthMin: Infinity,
    platLengthMax: -Infinity,
  };

  // platforms
  lvd.collisions.forEach((plat) => {
    if (!plat.col_flags.drop_through) {
      return;
    }

    // ignore plats that are out of bounds
    if (
      plat.vertices.every((vert) => {
        const bound = lvd.blast_zone[0];
        if (!bound) {
          return true;
        }
        if (
          vert.x + plat.entry.start_pos.x > bound.right ||
          vert.x + plat.entry.start_pos.x < bound.left ||
          vert.y + plat.entry.start_pos.y > bound.top ||
          vert.y + plat.entry.start_pos.y < bound.bottom
        ) {
          return true;
        }
        return false;
      })
    ) {
      return;
    }
    stats.platNum++;

    // calculate min/max for this specific platform
    let platMinX = Infinity;
    let platMaxX = -Infinity;
    let platMinY = Infinity;
    let platMaxY = -Infinity;
    plat.vertices.forEach((vert) => {
      const bound = lvd.blast_zone[0];
      if (!bound) {
        return;
      }
      if (
        vert.x + plat.entry.start_pos.x > bound.right ||
        vert.x + plat.entry.start_pos.x < bound.left ||
        vert.y + plat.entry.start_pos.y > bound.top ||
        vert.y + plat.entry.start_pos.y < bound.bottom
      ) {
        return;
      }

      platMinX = Math.min(platMinX, vert.x + plat.entry.start_pos.x);
      platMaxX = Math.max(platMaxX, vert.x + plat.entry.start_pos.x);
      platMinY = Math.min(platMinY, vert.y + plat.entry.start_pos.y);
      platMaxY = Math.max(platMaxY, vert.y + plat.entry.start_pos.y);
    });

    // calculate min/max for all the platforms
    stats.platMinX = Math.min(stats.platMinX, platMinX);
    stats.platMaxX = Math.max(stats.platMaxX, platMaxX);
    stats.platMinY = Math.min(stats.platMinY, platMinY);
    stats.platMaxY = Math.max(stats.platMaxY, platMaxY);

    if (
      Number.isFinite(platMinX) &&
      Number.isFinite(platMaxX) &&
      platMinX !== platMaxX
    ) {
      stats.platLengthMin = Math.min(stats.platLengthMin, platMaxX - platMinX);
      stats.platLengthMax = Math.max(stats.platLengthMax, platMaxX - platMinX);
    }
  });

  // non-platforms
  lvd.collisions.forEach((stage) => {
    if (stage.col_flags.drop_through) {
      return;
    }

    // ignore stages that are out of bounds
    if (
      stage.vertices.every((vert) => {
        const bound = lvd.blast_zone[0];
        if (!bound) {
          return true;
        }
        if (
          vert.x + stage.entry.start_pos.x > bound.right ||
          vert.x + stage.entry.start_pos.x < bound.left ||
          vert.y + stage.entry.start_pos.y > bound.top ||
          vert.y + stage.entry.start_pos.y < bound.bottom
        ) {
          return true;
        }
        return false;
      })
    ) {
      return;
    }

    stage.vertices.forEach((vert) => {
      const bound = lvd.blast_zone[0];
      if (!bound) {
        return;
      }
      if (
        vert.x + stage.entry.start_pos.x > bound.right ||
        vert.x + stage.entry.start_pos.x < bound.left ||
        vert.y + stage.entry.start_pos.y > bound.top ||
        vert.y + stage.entry.start_pos.y < bound.bottom
      ) {
        return;
      }

      stats.stageMinX = Math.min(
        stats.stageMinX,
        vert.x + stage.entry.start_pos.x
      );
      stats.stageMaxX = Math.max(
        stats.stageMaxX,
        vert.x + stage.entry.start_pos.x
      );
      stats.stageMinY = Math.min(
        stats.stageMinY,
        vert.y + stage.entry.start_pos.y
      );
      stats.stageMaxY = Math.max(
        stats.stageMaxY,
        vert.y + stage.entry.start_pos.y
      );
    });
  });

  stats.stageWidth = stats.stageMaxX - stats.stageMinX;
  stats.stageWidth = Number.isFinite(stats.stageWidth) ? stats.stageWidth : 0;
  lvd.lvdStats = stats;
}

const LVD_NAME_MAP: Map<string, string> = new Map<string, string>([
  ["animal_city", "Town & City"],
  ["animal_island", "Tortimer Island"],
  ["animal_village", "Smashville"],
  ["balloonfight", "Balloon Fight"],
  ["battlefield", "Battlefield"],
  ["battlefield_l", "Big Battlefield"],
  ["battlefield_s", "Duel Battlefield"],
  ["bayo_clock", "Umbra Clock Tower"],
  ["bossstage_final1", "Final Destination"],
  ["bossstage_final2", "Deadline"],
  ["brave_altar", "Yggdrasil's Altar"],
  ["buddy_spiral", "Spiral Mountain"],
  ["demon_dojo", "Mishima Dojo"],
  ["dk_jungle", "Bramble Blast"],
  ["dk_lodge", "Jungle Japes"],
  ["dk_waterfall", "Kongo Falls"],
  ["dolly_stadium", "King of Fighters Stadium"],
  ["dracula_castle", "Dracula's Castle"],
  ["duckhunt", "Duck Hunt"],
  ["end", "bossstage_final1"],
  ["fe_arena", "Arena Ferox"],
  ["fe_colloseum", "Coliseum"],
  ["fe_shrine", "Garreg Mach Monastery"],
  ["fe_siege", "Castle Siege"],
  ["ff_cave", "Northern Cave"],
  ["ff_midgar", "Midgar"],
  ["flatzonex", "Flat Zone X"],
  ["fox_corneria", "Corneria"],
  ["fox_lylatcruise", "Lylat Cruise"],
  ["fox_venom", "Venom"],
  ["fzero_bigblue", "Big Blue"],
  ["fzero_mutecity3ds", "Mute City SNES"],
  ["fzero_porttown", "Port Town Aero Dive"],
  ["icarus_angeland", "Palutena's Temple"],
  ["icarus_skyworld", "Skyworld"],
  ["icarus_uprising", "Reset Bomb Forest"],
  ["ice_top", "Summit"],
  ["jack_mementoes", "Mementos"],
  ["kart_circuitfor", "Mario Circuit"],
  ["kart_circuitx", "Figure-8 Circuit"],
  ["kirby_cave", "Great Cave Offensive"],
  ["kirby_fountain", "Fountain of Dreams"],
  ["kirby_gameboy", "Dream Land GB"],
  ["kirby_greens", "Green Greens"],
  ["kirby_halberd", "Halberd"],
  ["kirby_pupupu64", "Dream Land"],
  ["luigimansion", "Luigi's Mansion"],
  ["mario_3dland", "3D Land"],
  ["mario_castle64", "Peach's Castle"],
  ["mario_castledx", "Bowser's Castle"],
  ["mario_dolpic", "Delfino Plaza"],
  ["mario_galaxy", "Mario Galaxy"],
  ["mario_maker", "Super Mario Maker"],
  ["mario_newbros2", "World 1-2"],
  ["mario_odyssey", "New Donk City Hall"],
  ["mario_paper", "Paper Mario"],
  ["mario_past64", "Mushroom Kingdom"],
  ["mario_pastusa", "Mushroom Kingdom II"],
  ["mario_pastx", "Mushroomy Kingdom"],
  ["mario_rainbow", "Rainbow Cruise"],
  ["mario_uworld", "Snake Train Chamber"],
  ["mariobros", "Mario Bros"],
  ["metroid_kraid", "Brinstar Depths"],
  ["metroid_norfair", "Norfair"],
  ["metroid_orpheon", "Frigate Orpheon"],
  ["metroid_zebesdx", "Brinstar"],
  ["mg_shadowmoses", "Shadow Moses Island"],
  ["mother_fourside", "Fourside"],
  ["mother_magicant", "Magicant"],
  ["mother_newpork", "New Pork City"],
  ["mother_onett", "Onett"],
  ["nintendogs", "Living Room"],
  ["pac_land", "Pac-Land"],
  ["pickel_world", "Minecraft World"],
  ["pictochat2", "Pictochat 2"],
  ["pikmin_garden", "Garden of Hope"],
  ["pikmin_planet", "Distant Planet"],
  ["pilotwings", "Pilotwings"],
  ["plankton", "Hanenbow"],
  ["poke_kalos", "Kalos Pokemon League"],
  ["poke_stadium", "Pokemon Stadium"],
  ["poke_stadium2", "Pokemon Stadium 3"],
  ["poke_tengam", "Spear Pillar"],
  ["poke_tower", "Prism Tower"],
  ["poke_unova", "Unova Pokemon League"],
  ["poke_yamabuki", "Saffron City"],
  ["punchoutsb", "Boxing Ring"],
  ["rock_wily", "Wily Castle"],
  ["sf_suzaku", "Suzaku Castle"],
  ["sonic_greenhill", "Sky Sanctuary Zone"],
  ["sonic_windyhill", "Windy Hill Zone"],
  ["spla_parking", "Moray Towers"],
  ["streetpass", "Find Mii"],
  ["tantan_spring", "Spring Stadium"],
  ["tomodachi", "Tomodachi Life"],
  ["trail_castle", "Hollow Bastion"],
  ["wario_gamer", "Gamer"],
  ["wario_madein", "WarioWare, Inc."],
  ["wiifit", "Wii Fit Studio"],
  ["wreckingcrew", "Realm of GameCube"],
  ["wufuisland", "Wuhu Island"],
  ["xeno_alst", "Cloud Sea of Alrest"],
  ["xeno_gaur", "Gaur Plain"],
  ["yoshi_cartboard", "Yoshi's Story"],
  ["yoshi_island", "Yoshi's Island"],
  ["yoshi_story", "Super Happy Tree"],
  ["yoshi_yoster", "Dinosaur Land"],
  ["zelda_gerudo", "Gerudo Valley"],
  ["zelda_greatbay", "Great Bay"],
  ["zelda_hyrule", "Hyrule Castle"],
  ["zelda_oldin", "Bridge of Eldin"],
  ["zelda_pirates", "Ganon's Tower"],
  ["zelda_skyward", "Skyloft"],
  ["zelda_temple", "Temple"],
  ["zelda_tower", "Great Plateau Tower"],
  ["zelda_train", "Spirit Train"],
]);

const MERGE_BLACKLIST = [
  "brave_altar/normal/param/brave_altar_00.yml",
  "brave_altar/normal/param/brave_altar_01.yml",

  "pickel_world/normal/param/pickel_world_01.yml",
  "pickel_world/normal/param/pickel_world_02.yml",
  "pickel_world/normal/param/pickel_world_03.yml",
  "pickel_world/normal/param/pickel_world_04.yml",
  "pickel_world/normal/param/pickel_world_05.yml",

  "pilotwings/normal/param/pilotwings_00.yml",
  "pilotwings/normal/param/pilotwings_01.yml",
];

const LVD_BLACKLIST = [
  "animal_island/normal/param/island_01.yml",
  "animal_island/normal/param/island_02.yml",
  "animal_island/normal/param/island_03.yml",
  "animal_island/normal/param/island_04.yml",
  "animal_island/normal/param/island_05.yml",

  "balloonfight/normal/param/balloonfight_01.yml",
  "balloonfight/normal/param/balloonfight_02.yml",

  "bonusgame/normal/param/bonus_game_00.yml",
  "bonusgame/normal/param/bonus_game_01.yml",
  "bonusgame/normal/param/bonus_game_02.yml",
  "bonusgame/normal/param/bonus_game_03.yml",

  "bossstage_dracula/normal/param/bossstage_dracula00.yml",
  "bossstage_final3/normal/param/bossstage_final3_00.yml",
  "bossstage_galleom/normal/param/bossstage_galleom00.yml",
  "bossstage_ganonboss/normal/param/bossstage_ganonboss00.yml",
  "bossstage_marx/normal/param/bossstage_marx00.yml",
  "bossstage_rathalos/normal/param/bossstage_rathalos00.yml",

  "campaignmap/normal/param/blank_00.yml",

  "end/normal/param/end_00.yml",

  "fe_shrine/normal/param/fe_shrine_01.yml",
  "fe_shrine/normal/param/fe_shrine_02.yml",
  "fe_shrine/normal/param/fe_shrine_03.yml",
  "fe_shrine/normal/param/fe_shrine_04.yml",

  "fe_siege/normal/param/xemblem01.yml",
  "fe_siege/normal/param/xemblem02.yml",

  "ff_midgar/normal/param/midgar_f01.yml",

  "homeruncontest/normal/param/homerun_f_00.yml",

  "icarus_skyworld/normal/param/xpalutena_01.yml",

  "icarus_uprising/normal/param/uprising_01.yml",

  "kirby_halberd/normal/param/xhalberd_01.yml", // 2nd form might actually have a different blastzone

  "mario_3dland/normal/param/3dland_01.yml",
  "mario_3dland/normal/param/3dland_02.yml",
  "mario_3dland/normal/param/3dland_03.yml",
  "mario_3dland/normal_s01/param/3dland_01.yml",
  "mario_3dland/normal_s01/param/3dland_02.yml",
  "mario_3dland/normal_s01/param/3dland_03.yml",

  "mario_dolpic/normal/param/xdolpic_01.yml",
  "mario_dolpic/normal/param/xdolpic_02.yml",
  "mario_dolpic/normal/param/xdolpic_03.yml",
  "mario_dolpic/normal/param/xdolpic_04.yml",
  "mario_dolpic/normal/param/xdolpic_05.yml",
  "mario_dolpic/normal/param/xdolpic_06.yml",
  "mario_dolpic/normal/param/xdolpic_07.yml",
  "mario_dolpic/normal/param/xdolpic_08.yml",
  "mario_dolpic/normal/param/xdolpic_09.yml",
  "mario_dolpic/normal/param/xdolpic_10.yml",
  "mario_dolpic/normal/param/xdolpic_11.yml",
  "mario_dolpic/normal/param/xdolpic_12.yml",

  "mario_maker/normal/param/mariomaker_01.yml",
  "mario_maker/normal/param/mariomaker_02.yml",
  "mario_maker/normal/param/mariomaker_03.yml",
  "mario_maker/normal/param/mariomaker_f_00.yml",

  "mario_odyssey/normal/param/mario_odyssey_01.yml",
  "mario_odyssey/normal/param/mario_odyssey_02.yml",
  "mario_odyssey/normal/param/mario_odyssey_03.yml",
  "mario_odyssey/normal/param/mario_odyssey_04.yml",
  "mario_odyssey/normal/param/mario_odyssey_05.yml",
  "mario_odyssey/normal/param/mario_odyssey_06.yml",

  "mario_paper/normal/param/paper_01.yml",
  "mario_paper/normal/param/paper_02.yml",

  "mario_pastx/normal/param/xmariopast_01.yml",
  "mario_pastx/normal/param/xmariopast_02.yml",
  "mario_pastx/normal/param/xmariopast_03.yml",

  "mario_rainbow/normal/param/mario_rainbow_01.yml",

  "mario_uworld/normal/param/mariou_00.yml",
  "mario_uworld/normal/param/mariou_02.yml",
  "mario_uworld/normal/param/mariou_03.yml",

  "pac_land/normal/param/pacland_01.yml",
  "pac_land/normal/param/pacland_02.yml",
  "pac_land/normal/param/pacland_03.yml",

  "photostage/normal/param/photostage.yml",

  "pickel_world/normal/param/pickel_world_00_gimmick_off.yml",
  "pickel_world/normal/param/pickel_world_01_gimmick_off.yml",
  "pickel_world/normal/param/pickel_world_02_gimmick_off.yml",
  "pickel_world/normal/param/pickel_world_03_gimmick_off.yml",
  "pickel_world/normal/param/pickel_world_04_gimmick_off.yml",
  "pickel_world/normal/param/pickel_world_05_gimmick_off.yml",

  "poke_kalos/normal/param/kalos_01.yml",

  "poke_stadium2/normal/param/xstadium_01.yml",
  "poke_stadium2/normal/param/xstadium_02.yml",
  "poke_stadium2/normal/param/xstadium_03.yml",
  "poke_stadium2/normal/param/xstadium_04.yml",

  "poke_tower/normal/param/prism_01.yml",

  "punchoutw/normal/param/punchout_00.yml",

  "resultstage/normal/param/blank_00.yml",
  "resultstage_edge/normal/param/blank_00.yml",
  "resultstage_jack/normal/param/blank_00.yml",

  "settingstage/normal/param/settingstage.yml",

  "shamfight/normal/param/battlefield_00.yml",

  "spiritsroulette/normal/param/spiritsroulette.yml",

  "sp_edit/normal/param/level_00.yml",
  "sp_edit/normal/param/level_01.yml",
  "sp_edit/normal/param/level_02.yml",

  "staffroll/normal/param/dummy.yml",

  "streetpass/normal/param/steetpass_01.yml",

  "training/normal/param/blank_00.yml",

  "wufuisland/normal/param/wufu_01.yml",
  "wufuisland/normal/param/wufu_02.yml",
  "wufuisland/normal/param/wufu_03.yml",
  "wufuisland/normal/param/wufu_04.yml",
  "wufuisland/normal/param/wufu_05.yml",
  "wufuisland/normal/param/wufu_06.yml",
  "wufuisland/normal/param/wufu_07.yml",
  "wufuisland/normal/param/wufu_08.yml",
  "wufuisland/normal/param/wufu_09.yml",
  "wufuisland/normal/param/wufu_10.yml",
  "wufuisland/normal/param/wufu_11.yml",
  "wufuisland/normal/param/wufu_12.yml",

  "yoshi_story/normal/param/yoshi_story_01.yml",

  "zelda_gerudo/normal/param/gerudo_01.yml",
  "zelda_gerudo/normal/param/gerudo_02.yml",

  "zelda_oldin/normal/param/xoldin_01.yml",

  "zelda_skyward/normal/param/skyward01.yml",
  "zelda_skyward/normal/param/skyward02.yml",
  "zelda_skyward/normal/param/skyward03.yml",
  "zelda_skyward/normal/param/skyward04.yml",
  "zelda_skyward/normal/param/skyward05.yml",
  "zelda_skyward/normal/param/skyward06.yml",
  "zelda_skyward/normal/param/skyward07.yml",
  "zelda_skyward/normal/param/skyward08.yml",
  "zelda_skyward/normal/param/skyward09.yml",
  "zelda_skyward/normal/param/skyward10.yml",
  "zelda_skyward/normal/param/skyward11.yml",
  "zelda_skyward/normal/param/skyward12.yml",
  "zelda_skyward/normal/param/skyward13.yml",
  "zelda_skyward/normal/param/skyward14.yml",
];

export const lvdService = {
  initLvdFromUrl,
  LVD_NAME_MAP,
};
