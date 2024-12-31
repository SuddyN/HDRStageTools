import { Lvd, LvdStats } from "../Types";

/// STAGELISTS

export enum StageFilter {
  All = "All Stages",
  Legal = "Legal Stages",
  Supported = "Supported Stages",
  GigatonHammer2 = "Gigaton Hammer 2",
}

export type StageFilterFunc = (name: string) => boolean;

const getFilterFunc = (name: string): StageFilterFunc => {
  let selectedFilterFunc;
  switch (name) {
    case StageFilter.Legal:
      selectedFilterFunc = legalFilterFunc;
      break;
    case StageFilter.Supported:
      selectedFilterFunc = supportedFilterFunc;
      break;
    case StageFilter.GigatonHammer2:
      selectedFilterFunc = gigaton2FilterFunc;
      break;
    default:
      selectedFilterFunc = allFilterFunc;
  }
  return selectedFilterFunc;
};

const allFilterFunc = (name: string): boolean => {
  return true;
};

const legalFilterFunc = (name: string): boolean => {
  if (
    [
      "3D Land",
      "Arena Ferox",
      "Battlefield",
      "Bowser's Castle",
      "Bramble Blast",
      "Brinstar Depths",
      "Duel Battlefield",
      "Final Destination",
      "Fountain of Dreams",
      "Fourside",
      "Frigate Orpheon",
      "Ganon's Tower",
      "Garreg Mach Monastery",
      "Green Greens",
      "Hollow Bastion",
      "Kalos Pokemon League",
      "Kongo Falls",
      "Lylat Cruise",
      "Mario Galaxy",
      "Moray Towers",
      "Northern Cave",
      "Palutena's Temple",
      "Paper Mario",
      "Pokemon Stadium 3",
      "Realm of GameCube",
      "Sky Sanctuary Zone",
      "Skyworld",
      "Smashville",
      "Spear Pillar",
      "Town & City",
      "Unova Pokemon League",
      "Venom",
      "World 1-2",
      "Yggdrasil's Altar (Part 2)",
      "Yoshi's Story",
    ].includes(name)
  ) {
    return true;
  }
  return false;
};

const supportedFilterFunc = (name: string): boolean => {
  if (legalFilterFunc(name)) {
    return true;
  }
  if (
    [
      "Boxing Ring",
      "Brinstar Depths",
      "Deadline",
      "Dream Land",
      "Find Mii",
      "Gerudo Valley",
      "Hyrule Castle",
      "Luigi's Mansion",
      "Midgar",
      "Mishima Dojo",
      "New Pork City",
      "Pokemon Stadium",
      "Snake Train Chamber (Part 2)",
      "Tomodachi Life",
    ].includes(name)
  ) {
    return true;
  }
  return false;
};

const gigaton2FilterFunc = (name: string): boolean => {
  if (
    [
      "Hollow Bastion",
      "Garreg Mach Monastery",
      "Battlefield",
      "Smashville",
      "Bramble Blast",
      "3D Land",
      "Lylat Cruise",
      "Realm of GameCube",
      "Sky Sanctuary Zone",
    ].includes(name)
  ) {
    return true;
  }
  return false;
};

/// SORTING

export enum SortDir {
  Ascending = "Ascending",
  Descending = "Descending",
}

export enum SortMode {
  Name = "Name",
  StageWidth = "Stage Width",
  PlatCount = "Platform Count",
  BZoneLeft = "Blastzone Left",
  BZoneRight = "Blastzone Right",
  BZoneTop = "Blastzone Top",
  BZoneBottom = "Blastzone Bottom",
  BZoneWidth = "Blastzone Width",
  BZoneHeight = "Blastzone Height",
  StageToBZoneLeft = "Stage to Blastzone Left",
  StageToBZoneRight = "Stage to Blastzone Right",
  PlatToBZoneTopMin = "Platform to Blastzone Top (min)",
  PlatToBZoneTopMax = "Platform to Blastzone Top (max)",
  PlatHeight = "Platform Height",
  PlatHeightSpan = "Distance Between Platform Heights",
  PlatWidthSpan = "Edge-to-Edge Platform Width",
}

export type StageSortFunc = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats
) => number;

const getSortSubtitle = (
  selectedSort: SortMode,
  selectedSortDir: SortDir,
  lvd: Lvd
): string => {
  let sortSub = "";
  if (!lvd.lvdStats) {
    return sortSub;
  }
  switch (selectedSort) {
    case SortMode.PlatCount:
      sortSub += lvd.lvdStats.platNum.toFixed(0);
      break;
    case SortMode.StageWidth:
      sortSub += lvd.lvdStats.stageWidth.toFixed(1);
      break;
    case SortMode.BZoneLeft:
      sortSub += (lvd.blast_zone[0]?.left * -1).toFixed(0);
      break;
    case SortMode.BZoneRight:
      sortSub += lvd.blast_zone[0]?.right.toFixed(0);
      break;
    case SortMode.BZoneTop:
      sortSub += lvd.blast_zone[0]?.top.toFixed(0);
      break;
    case SortMode.BZoneBottom:
      sortSub += (lvd.blast_zone[0]?.bottom * -1).toFixed(0);
      break;
    case SortMode.BZoneWidth:
      sortSub += (lvd.blast_zone[0]?.right - lvd.blast_zone[0]?.left).toFixed(
        0
      );
      break;
    case SortMode.BZoneHeight:
      sortSub += (lvd.blast_zone[0]?.top - lvd.blast_zone[0]?.bottom).toFixed(
        0
      );
      break;
    case SortMode.StageToBZoneLeft:
      sortSub += (lvd.lvdStats.stageMinX - lvd.blast_zone[0].left).toFixed(1);
      break;
    case SortMode.StageToBZoneRight:
      sortSub += (lvd.blast_zone[0].right - lvd.lvdStats.stageMaxX).toFixed(1);
      break;
    case SortMode.PlatToBZoneTopMin:
      sortSub += (lvd.blast_zone[0].top - lvd.lvdStats.platMaxY).toFixed(1);
      break;
    case SortMode.PlatToBZoneTopMax:
      sortSub += (lvd.blast_zone[0].top - lvd.lvdStats.platMinY).toFixed(1);
      break;
    case SortMode.PlatHeight: {
      let min = lvd.lvdStats.platMinY;
      let max = lvd.lvdStats.platMaxY;
      if (min.toFixed(1) === max.toFixed(1)) {
        sortSub += min.toFixed(1);
      } else if (selectedSortDir === SortDir.Descending) {
        sortSub += `${max.toFixed(1)} (${min.toFixed(1)})`;
      } else {
        sortSub += `${min.toFixed(1)} (${max.toFixed(1)})`;
      }
      break;
    }
    case SortMode.PlatHeightSpan:
      sortSub += (lvd.lvdStats.platMaxY - lvd.lvdStats.platMinY).toFixed(1);
      break;
    case SortMode.PlatWidthSpan:
      sortSub += (lvd.lvdStats.platMaxX - lvd.lvdStats.platMinX).toFixed(1);
      break;
    default:
      break;
  }
  sortSub = sortSub.replace("-Infinity", "N/A").replace("Infinity", "N/A");
  return sortSub;
};

const getSortFunc = (name: string): StageSortFunc => {
  switch (name) {
    case SortMode.PlatCount:
      return platNumCompareFn;
    case SortMode.StageWidth:
      return stageWidthCompareFn;
    case SortMode.BZoneLeft:
      return blastzoneLeftCompareFn;
    case SortMode.BZoneRight:
      return blastzoneRightCompareFn;
    case SortMode.BZoneTop:
      return blastzoneTopCompareFn;
    case SortMode.BZoneBottom:
      return blastzoneBottomCompareFn;
    case SortMode.BZoneWidth:
      return blastzoneWidthCompareFn;
    case SortMode.BZoneHeight:
      return blastzoneHeightCompareFn;
    case SortMode.StageToBZoneLeft:
      return stageToBlastzoneLeftCompareFn;
    case SortMode.StageToBZoneRight:
      return stageToBlastzoneRightCompareFn;
    case SortMode.PlatToBZoneTopMin:
      return platformToBlastzoneTopMinCompareFn;
    case SortMode.PlatToBZoneTopMax:
      return platformToBlastzoneTopMaxCompareFn;
    case SortMode.PlatHeight:
      return platformHeightCompareFn;
    case SortMode.PlatHeightSpan:
      return platformHeightSpanCompareFn;
    case SortMode.PlatWidthSpan:
      return platformWidthSpanCompareFn;
    default:
      return nameCompareFn;
  }
};

// define sort functions
const nameCompareFn = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats
): number => {
  const mul = selectedSortDir === SortDir.Ascending ? 1 : -1;
  if (a.name < b.name) return -1 * mul;
  else if (a.name > b.name) return 1 * mul;
  return 0;
};

const platNumCompareFn = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats
): number => {
  const mul = selectedSortDir === SortDir.Ascending ? 1 : -1;
  return (a.platNum - b.platNum) * mul;
};

const stageWidthCompareFn = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats
): number => {
  const mul = selectedSortDir === SortDir.Ascending ? 1 : -1;
  return (a.stageWidth - b.stageWidth) * mul;
};

const blastzoneLeftCompareFn = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats
): number => {
  const mul = selectedSortDir === SortDir.Ascending ? 1 : -1;
  const aBlstZone = lvdMap.get(a.name)?.blast_zone[0];
  const bBlstZone = lvdMap.get(b.name)?.blast_zone[0];
  if (!aBlstZone) {
    return -1 * mul;
  }
  if (!bBlstZone) {
    return 1 * mul;
  }
  return (bBlstZone.left - aBlstZone.left) * mul;
};

const blastzoneRightCompareFn = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats
): number => {
  const mul = selectedSortDir === SortDir.Ascending ? 1 : -1;
  const aBlstZone = lvdMap.get(a.name)?.blast_zone[0];
  const bBlstZone = lvdMap.get(b.name)?.blast_zone[0];
  if (!aBlstZone) {
    return -1 * mul;
  }
  if (!bBlstZone) {
    return 1 * mul;
  }
  return (aBlstZone.right - bBlstZone.right) * mul;
};

const blastzoneTopCompareFn = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats
): number => {
  const mul = selectedSortDir === SortDir.Ascending ? 1 : -1;
  const aBlstZone = lvdMap.get(a.name)?.blast_zone[0];
  const bBlstZone = lvdMap.get(b.name)?.blast_zone[0];
  if (!aBlstZone) {
    return -1 * mul;
  }
  if (!bBlstZone) {
    return 1 * mul;
  }
  return (aBlstZone.top - bBlstZone.top) * mul;
};

const blastzoneBottomCompareFn = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats
): number => {
  const mul = selectedSortDir === SortDir.Ascending ? 1 : -1;
  const aBlstZone = lvdMap.get(a.name)?.blast_zone[0];
  const bBlstZone = lvdMap.get(b.name)?.blast_zone[0];
  if (!aBlstZone) {
    return -1 * mul;
  }
  if (!bBlstZone) {
    return 1 * mul;
  }
  return (bBlstZone.bottom - aBlstZone.bottom) * mul;
};

const blastzoneWidthCompareFn = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats
): number => {
  const mul = selectedSortDir === SortDir.Ascending ? 1 : -1;
  const aBlstZone = lvdMap.get(a.name)?.blast_zone[0];
  const bBlstZone = lvdMap.get(b.name)?.blast_zone[0];
  if (!aBlstZone) {
    return -1 * mul;
  }
  if (!bBlstZone) {
    return 1 * mul;
  }
  const aNum = aBlstZone.right - aBlstZone.left;
  const bNum = bBlstZone.right - bBlstZone.left;
  return (aNum - bNum) * mul;
};

const blastzoneHeightCompareFn = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats
): number => {
  const mul = selectedSortDir === SortDir.Ascending ? 1 : -1;
  const aBlstZone = lvdMap.get(a.name)?.blast_zone[0];
  const bBlstZone = lvdMap.get(b.name)?.blast_zone[0];
  if (!aBlstZone) {
    return -1 * mul;
  }
  if (!bBlstZone) {
    return 1 * mul;
  }
  const aNum = aBlstZone.top - aBlstZone.bottom;
  const bNum = bBlstZone.top - bBlstZone.bottom;
  return (aNum - bNum) * mul;
};

const stageToBlastzoneLeftCompareFn = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats
): number => {
  const mul = selectedSortDir === SortDir.Ascending ? 1 : -1;
  const aLvd = lvdMap.get(a.name);
  const bLvd = lvdMap.get(b.name);
  if (!aLvd?.blast_zone[0] || !aLvd.lvdStats) {
    return -1 * mul;
  }
  if (!bLvd?.blast_zone[0] || !bLvd.lvdStats) {
    return 1 * mul;
  }
  const aNum = aLvd.lvdStats.stageMinX - aLvd.blast_zone[0].left;
  const bNum = bLvd.lvdStats.stageMinX - bLvd.blast_zone[0].left;
  return (aNum - bNum) * mul;
};

const stageToBlastzoneRightCompareFn = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats
): number => {
  const mul = selectedSortDir === SortDir.Ascending ? 1 : -1;
  const aLvd = lvdMap.get(a.name);
  const bLvd = lvdMap.get(b.name);
  if (!aLvd?.blast_zone[0] || !aLvd.lvdStats) {
    return -1 * mul;
  }
  if (!bLvd?.blast_zone[0] || !bLvd.lvdStats) {
    return 1 * mul;
  }
  const aNum = aLvd.blast_zone[0].right - aLvd.lvdStats.stageMaxX;
  const bNum = bLvd.blast_zone[0].right - bLvd.lvdStats.stageMaxX;
  return (aNum - bNum) * mul;
};

const platformToBlastzoneTopMinCompareFn = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats
): number => {
  const mul = selectedSortDir === SortDir.Ascending ? 1 : -1;
  const aLvd = lvdMap.get(a.name);
  const bLvd = lvdMap.get(b.name);
  if (!aLvd?.blast_zone[0] || !aLvd.lvdStats) {
    return -1 * mul;
  }
  if (!bLvd?.blast_zone[0] || !bLvd.lvdStats) {
    return 1 * mul;
  }
  const aNum = aLvd.blast_zone[0].top - aLvd.lvdStats.platMaxY;
  const bNum = bLvd.blast_zone[0].top - bLvd.lvdStats.platMaxY;
  return (aNum - bNum) * mul;
};

const platformToBlastzoneTopMaxCompareFn = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats
): number => {
  const mul = selectedSortDir === SortDir.Ascending ? 1 : -1;
  const aLvd = lvdMap.get(a.name);
  const bLvd = lvdMap.get(b.name);
  if (!aLvd?.blast_zone[0] || !aLvd.lvdStats) {
    return -1 * mul;
  }
  if (!bLvd?.blast_zone[0] || !bLvd.lvdStats) {
    return 1 * mul;
  }
  const aNum = aLvd.blast_zone[0].top - aLvd.lvdStats.platMinY;
  const bNum = bLvd.blast_zone[0].top - bLvd.lvdStats.platMinY;
  return (aNum - bNum) * mul;
};

const platformHeightCompareFn = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats
): number => {
  const mul = selectedSortDir === SortDir.Ascending ? 1 : -1;
  const aLvd = lvdMap.get(a.name);
  const bLvd = lvdMap.get(b.name);
  if (!aLvd?.lvdStats) {
    return -1 * mul;
  }
  if (!bLvd?.lvdStats) {
    return 1 * mul;
  }
  if (selectedSortDir === SortDir.Ascending) {
    return aLvd.lvdStats.platMinY - bLvd.lvdStats.platMinY;
  } else {
    return bLvd.lvdStats.platMaxY - aLvd.lvdStats.platMaxY;
  }
};

const platformHeightSpanCompareFn = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats
): number => {
  const mul = selectedSortDir === SortDir.Ascending ? 1 : -1;
  const aLvd = lvdMap.get(a.name);
  const bLvd = lvdMap.get(b.name);
  if (!aLvd?.lvdStats) {
    return -1 * mul;
  }
  if (!bLvd?.lvdStats) {
    return 1 * mul;
  }
  const aNum = aLvd.lvdStats.platMaxY - aLvd.lvdStats.platMinY;
  const bNum = bLvd.lvdStats.platMaxY - bLvd.lvdStats.platMinY;
  return (aNum - bNum) * mul;
};

const platformWidthSpanCompareFn = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats
): number => {
  const mul = selectedSortDir === SortDir.Ascending ? 1 : -1;
  const aLvd = lvdMap.get(a.name);
  const bLvd = lvdMap.get(b.name);
  if (!aLvd?.lvdStats) {
    return -1 * mul;
  }
  if (!bLvd?.lvdStats) {
    return 1 * mul;
  }
  const aNum = aLvd.lvdStats.platMaxX - aLvd.lvdStats.platMinX;
  const bNum = bLvd.lvdStats.platMaxX - bLvd.lvdStats.platMinX;
  return (aNum - bNum) * mul;
};

export const stageListService = {
  getFilterFunc,
  getSortFunc,
  getSortSubtitle,
};
