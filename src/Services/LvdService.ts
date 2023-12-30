import JSZip from "jszip";
import * as JSYaml from "js-yaml";
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

  return lvdMap;
}

function alignLvd(lvd: Lvd) {
  if (!lvd.blast_zone[0] && !lvd.camera_boundary[0]) {
    return;
  }

  const { left, right, top, bottom } =
    lvd.blast_zone[0] ?? lvd.camera_boundary[0];
  const center: Vec2 = {
    x: (left + right) / 2,
    y: 0.0,
  };

  lvd.collisions.forEach((collision) => {
    collision.entry.start_pos.x -= center.x;
    collision.entry.start_pos.y -= center.y;
    collision.vertices.forEach((vertex) => {
      vertex.x -= center.x;
      vertex.y -= center.y;
    });
  });
  lvd.spawns.forEach((spawn) => {
    spawn.entry.start_pos.x -= center.x;
    spawn.entry.start_pos.y -= center.y;
    spawn.pos.x -= center.x;
    spawn.pos.y -= center.y;
  });
  lvd.respawns.forEach((respawn) => {
    respawn.entry.start_pos.x -= center.x;
    respawn.entry.start_pos.y -= center.y;
    respawn.pos.x -= center.x;
    respawn.pos.y -= center.y;
  });
  lvd.camera_boundary.forEach((camera_boundary) => {
    camera_boundary.entry.start_pos.x -= center.x;
    camera_boundary.entry.start_pos.y -= center.y;
    camera_boundary.left -= center.x;
    camera_boundary.right -= center.x;
    camera_boundary.top -= center.y;
    camera_boundary.bottom -= center.y;
  });
  lvd.blast_zone.forEach((blast_zone) => {
    blast_zone.entry.start_pos.x -= center.x;
    blast_zone.entry.start_pos.y -= center.y;
    blast_zone.left -= center.x;
    blast_zone.right -= center.x;
    blast_zone.top -= center.y;
    blast_zone.bottom -= center.y;
  });
  lvd.item_spawners.forEach((item_spawner) => {
    item_spawner.entry.start_pos.x -= center.x;
    item_spawner.entry.start_pos.y -= center.y;
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
    ptrainer_platform.entry.start_pos.x -= center.x;
    ptrainer_platform.entry.start_pos.y -= center.y;
    ptrainer_platform.pos.x -= center.x;
    ptrainer_platform.pos.y -= center.y;
  });
  lvd.shrunken_camera_boundary.forEach((camera_boundary) => {
    camera_boundary.entry.start_pos.x -= center.x;
    camera_boundary.entry.start_pos.y -= center.y;
    camera_boundary.left -= center.x;
    camera_boundary.right -= center.x;
    camera_boundary.top -= center.y;
    camera_boundary.bottom -= center.y;
  });
  lvd.shrunken_blast_zone.forEach((blast_zone) => {
    blast_zone.entry.start_pos.x -= center.x;
    blast_zone.entry.start_pos.y -= center.y;
    blast_zone.left -= center.x;
    blast_zone.right -= center.x;
    blast_zone.top -= center.y;
    blast_zone.bottom -= center.y;
  });
}

async function readLvdFromUrl(url: string): Promise<Map<string, Lvd>> {
  const blob = await getLvdZipFromUrl(url);
  return await readLvdFromZip(blob);
}
