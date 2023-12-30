import JSZip from "jszip";
import * as JSYaml from "js-yaml";
import { Lvd } from "../Types";

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
      console.log(file.name, stageLvd);
      if (
        !stageLvd.blast_zone ||
        !stageLvd.camera_boundary ||
        !stageLvd.collisions
      ) {
        throw `bad lvd for ${file.name}`;
      }
      lvdMap.set(file.name, stageLvd);
    } catch (e) {
      console.warn(e);
    }
  }

  return lvdMap;
}

async function readLvdFromUrl(url: string): Promise<Map<string, Lvd>> {
  const blob = await getLvdZipFromUrl(url);
  return await readLvdFromZip(blob);
}
