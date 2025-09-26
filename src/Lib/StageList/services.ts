import { Lvd, LvdStats } from "../Lvd/types";

/// STAGELISTS

export enum StageFilter {
  All = "All Stages",
  Supported = "Supported Stages",
  Legal = "Legal Stages",
  Illegal = "Illegal Stages",
  Seasonal_v0_49_6 = "Seasonal v0.49.6",
  Seasonal_v0_48_10 = "Seasonal v0.48.10",
  GigatonHammer3 = "Gigaton Hammer 3",
  Undertow2024 = "Undertow 2024",
  KaylaSpookySmash4 = "Kayla's Spooky Smash 4",
}

export type StageFilterFunc = (name: string) => boolean;

const getFilterFunc = (name: string): StageFilterFunc => {
  let selectedFilterFunc;
  switch (name) {
    case StageFilter.Supported:
      selectedFilterFunc = supportedFilterFunc;
      break;
    case StageFilter.Legal:
      selectedFilterFunc = legalFilterFunc;
      break;
    case StageFilter.Illegal:
      selectedFilterFunc = illegalFilterFunc;
      break;
    case StageFilter.Seasonal_v0_49_6:
      selectedFilterFunc = seasonal_v0_49_6FilterFunc;
      break;
    case StageFilter.Seasonal_v0_48_10:
      selectedFilterFunc = seasonal_v0_48_10FilterFunc;
      break;
    case StageFilter.GigatonHammer3:
      selectedFilterFunc = gigatonHammer3FilterFunc;
      break;
    case StageFilter.Undertow2024:
      selectedFilterFunc = undertow2024FilterFunc;
      break;
    case StageFilter.KaylaSpookySmash4:
      selectedFilterFunc = kaylaSpookySmash4FilterFunc;
      break;
    default:
      selectedFilterFunc = allFilterFunc;
  }
  return selectedFilterFunc;
};

const gigatonHammer3FilterFunc = (name: string): boolean => {
  if (
    [
      "Battlefield",
      "Bramble Blast",
      "Bowser's Castle",
      "Duel Battlefield",
      "Garreg Mach Monastery",
      "Hollow Bastion",
      "Realm of GameCube",
      "Smashville",
    ].includes(name)
  ) {
    return true;
  }
  return false;
};

const seasonal_v0_49_6FilterFunc = (name: string): boolean => {
  if (
    [
      "Battlefield",
      "Bramble Blast",
      "Frigate Husk",
      "Garreg Mach Monastery",
      "Hollow Bastion",
      "Northern Cave",
      "Realm of GameCube",
      "Smashville",
      "Sky Sanctuary Zone",
    ].includes(name)
  ) {
    return true;
  }
  return false;
};

const seasonal_v0_48_10FilterFunc = (name: string): boolean => {
  if (
    [
      "Battlefield",
      "Bramble Blast",
      "Frigate Husk",
      "Garreg Mach Monastery",
      "Great Bay",
      "Hollow Bastion",
      "Mario Galaxy",
      "Realm of GameCube",
      "Smashville",
    ].includes(name)
  ) {
    return true;
  }
  return false;
};

const undertow2024FilterFunc = (name: string): boolean => {
  if (
    [
      "3D Land",
      "Battlefield",
      "Bramble Blast",
      "Garreg Mach Monastery",
      "Green Greens",
      "Realm of GameCube",
      "Sky Sanctuary Zone",
      "Smashville",
      "World 1-2",
    ].includes(name)
  ) {
    return true;
  }
  return false;
};

const kaylaSpookySmash4FilterFunc = (name: string): boolean => {
  if (
    [
      "3D Land",
      "Battlefield",
      "Bramble Blast",
      "Garreg Mach Monastery",
      "Green Greens",
      "Lylat Cruise",
      "Realm of GameCube",
      "Sky Sanctuary Zone",
      "Smashville",
    ].includes(name)
  ) {
    return true;
  }
  return false;
};

const legalFilterFunc = (name: string): boolean => {
  if (
    [
      "3D Land",
      "Arena Ferox",
      "Battlefield",
      "Bowser's Castle",
      "Boxing Ring",
      "Bramble Blast",
      "Brinstar Depths",
      "Deadline",
      "Duel Battlefield",
      "Final Destination",
      "Find Mii",
      "Fountain of Dreams",
      "Fourside",
      "Frigate Husk",
      "Ganon's Tower",
      "Garreg Mach Monastery",
      "Gaur Plain",
      "Great Bay",
      "Green Greens",
      "Hollow Bastion",
      "Kalos Pokemon League",
      "Luigi's Mansion",
      "Lylat Cruise",
      "Mario Galaxy",
      "Mishima Dojo",
      "Moray Towers",
      "New Pork City",
      "Northern Cave",
      "Palutena's Temple",
      "Paper Mario",
      "Pokemon Stadium 3",
      "Realm of GameCube",
      "Sky Sanctuary Zone",
      "Skyworld",
      "Smashville",
      "Snake Train Chamber (Part 2)",
      "Spear Pillar",
      "Super Happy Tree",
      "Town & City",
      "Unova Pokemon League",
      "Venom",
      "WarioWare, Inc.",
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
      "Balloon Fight",
      "Big Battlefield",
      "Brinstar Depths",
      "Cloud Sea of Alrest",
      "Coliseum",
      "Dinosaur Land",
      "Dracula's Castle",
      "Dream Land",
      "Duck Hunt",
      "Garden of Hope",
      "Jungle Japes",
      "Kongo Falls",
      "Living Room",
      "Midgar",
      "Minecraft World",
      "Mushroom Kingdom",
      "Pokemon Stadium",
      "Pilotwings",
      "Pilotwings (Part 2)",
      "Reset Bomb Forest",
      "Skyloft",
      "Spiral Mountain",
      "Spring Stadium",
      "Summit",
      "Suzaku Castle",
      "Tomodachi Life",
      "Umbra Clock Tower",
      "Wii Fit Studio",
      "Windy Hill Zone",
      "Yoshi's Island",
    ].includes(name)
  ) {
    return true;
  }
  return false;
};

const allFilterFunc = (name: string): boolean => {
  return true;
};

const illegalFilterFunc = (name: string): boolean => {
  return supportedFilterFunc(name) && !legalFilterFunc(name);
};

/// SORTING

export enum SortDir {
  Ascending = "Ascending",
  Descending = "Descending",
}

export enum SortMode {
  Name = "Name",
  StageWidth = "Stage Width",
  StageAsymmetry = "Stage Asymmetry",
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
    case SortMode.StageAsymmetry:
      sortSub += (lvd.lvdStats.stageMaxX + lvd.lvdStats.stageMinX).toFixed(2);
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
    case SortMode.StageAsymmetry:
      return stageAsymmetryCompareFn;
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

const stageAsymmetryCompareFn = (
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

  const aNum = aLvd.lvdStats.stageMaxX + aLvd.lvdStats.stageMinX;
  const bNum = bLvd.lvdStats.stageMaxX + bLvd.lvdStats.stageMinX;
  return (aNum - bNum) * mul;
};

export const stageListService = {
  getFilterFunc,
  getSortFunc,
  getSortSubtitle,
};
