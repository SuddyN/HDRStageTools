import JSZip, { file } from "jszip";
import * as JSYaml from "js-yaml";
import * as lodash from "lodash";
import { Lvd, Vec2 } from "../Types";

export const lvdService = {
  readLvdFromUrl,
};

async function getLvdZipFromUrl(url: string): Promise<Blob> {
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

async function readLvdFromZip(blob: Blob): Promise<Map<string, Lvd>> {
  const lvdMap: Map<string, Lvd> = new Map<string, Lvd>();

  const jszip = new JSZip();
  const zip = await jszip.loadAsync(blob);
  for (const file of Object.values(zip.files)) {
    if (file.dir) {
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
        throw `bad lvd for ${file.name}`;
      }

      alignLvd(stageLvd);

      lvdMap.set(file.name, stageLvd);
    } catch (e) {
      console.warn(e);
    }
  }

  return mergeLvd(lvdMap);
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

  const { left, right, top, bottom } =
    lvd.blast_zone[0] ?? lvd.camera_boundary[0];
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
  for (var i = 0; i < d.length - 1; i++) {
    if (d[i] != o[i]) {
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

function mergeLvd(lvdMap: Map<string, Lvd>): Map<string, Lvd> {
  const newMap: Map<string, Lvd> = new Map<string, Lvd>();
  for (const entry of Array.from(lvdMap.entries())) {
    const dir = entry[0].split("/");
    for (const other of Array.from(lvdMap.entries())) {
      if (entry[0] == other[0]) {
        continue;
      }
      if (lvdEqual(entry[1], other[1])) {
        console.log("removed", other[0], "equal");
        other[1].remove = true;
        continue;
      }
      if (lvdPartExists(entry[0], other[0])) {
        mergeStage(entry[1], other[1]);
        console.log("removed", other[0], "merged");
        other[1].remove = true;
        continue;
      }
    }

    if (entry[1].remove) {
      continue;
    }

    const altNum = parseInt(dir[1].replace(/\D/g, ""));
    const fileName = dir[dir.length - 1].split(".")[0];
    const partNum = parseInt(fileName.slice(-2).replace(/\D/g, ""));
    const name =
      dir[0] +
      (isNaN(altNum) ? "" : ` (Alt ${altNum})`) +
      (isNaN(partNum) || partNum == 0 ? "" : ` (Part ${partNum + 1})`);
    newMap.set(name, entry[1]);
  }

  return newMap;
}

async function readLvdFromUrl(url: string): Promise<Map<string, Lvd>> {
  const blob = await getLvdZipFromUrl(url);
  return await readLvdFromZip(blob);
}
