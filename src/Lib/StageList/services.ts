import { Lvd, LvdStats } from "../Lvd/types";

/// STAGELISTS

export enum StageFilter {
  // Seasonal_v0_50_8 = "Seasonal v0.50.8",
  Legal = "Legal Stages",
  Illegal = "Illegal Stages",
  Supported = "Supported Stages",
  Unsupported = "Unsupported Stages",
  All = "All Stages",
}

export type StageFilterFunc = (name: string) => boolean;

const getFilterFunc = (name: string): StageFilterFunc => {
  let selectedFilterFunc;
  switch (name) {
    // case StageFilter.Seasonal_v0_50_8:
    //   selectedFilterFunc = seasonal_v0_50_8FilterFunc;
    //   break;
    case StageFilter.Legal:
      selectedFilterFunc = legalFilterFunc;
      break;
    case StageFilter.Illegal:
      selectedFilterFunc = illegalFilterFunc;
      break;
    case StageFilter.Supported:
      selectedFilterFunc = supportedFilterFunc;
      break;
    case StageFilter.Unsupported:
      selectedFilterFunc = unsupportedFilterFunc;
      break;
    default:
      selectedFilterFunc = allFilterFunc;
  }
  return selectedFilterFunc;
};

// const seasonal_v0_50_8FilterFunc = (name: string): boolean => {
//   if (
//     [
//       "Battlefield",
//       "Frigate Husk",
//       "Northern Cave",
//       "Pokemon Stadium 3",
//       "Royal Sanctum",
//       "Sky Sanctuary Zone",
//       "Smashville",
//       "Spear Pillar",
//       "Yoshi's Island",
//     ].includes(name)
//   ) {
//     return true;
//   }
//   return false;
// };

const unsupportedFilterFunc = (name: string): boolean => {
  if (
    [
      "75m",
      "Big Blue",
      "Boxing Ring",
      "Butter Building", // TODO: really need to fix this one
      "Distant Planet",
      "Figure-8 Circuit",
      "Flat Zone X",
      "Gamer",
      "Great Cave Offensive",
      "Halberd",
      "King of Fighters Stadium",
      "Mario Bros",
      "Mementos",
      "Mushroom Kingdom II",
      "Mushroomy Kingdom",
      "Mute City SNES",
      "New Donk City Hall",
      "Norfair", // TODO: needs fixed
      "Onett",
      "Pac-Land",
      "Peach's Castle",
      "Pictochat 2",
      "Pilotwings",
      "Pilotwings (Part 2)",
      "Poke Floats",
      "Port Town Aero Dive",
      "Prism Tower",
      "Rainbow Cruise",
      "Saffron City",
      "Saffron City (Alt 1)",
      "Shadow Moses Island",
      "Spirit Train",
      "Super Mario Maker",
      "Suzaku Castle (Alt 1)",
      "Temple",
      "Wuhu Island", // TODO: needs fixed
      "settingstage (Alt 1)",
    ].includes(name)
  ) {
    return true;
  }
  return false;
};

const supportedFilterFunc = (name: string): boolean => {
  // opposite of unsupported stages
  if (unsupportedFilterFunc(name)) {
    return false;
  }
  return true;
};

const illegalFilterFunc = (name: string): boolean => {
  // unsupported stages always excluded
  if (unsupportedFilterFunc(name)) {
    return false;
  }

  // illegal stages
  if (
    [
      "Balloon Fight",
      "Big Battlefield",
      "Brinstar",
      "Cloud Sea of Alrest",
      "Coliseum",
      "Corneria",
      "Corneria (Alt 1)",
      "Deadline (Alt 1)",
      "Delfino Plaza",
      "Dracula's Castle",
      "Duck Hunt",
      "Garden of Hope",
      "Gaur Plain",
      "Hanenbow",
      "Hyrule Castle",
      "Jungle Japes",
      "Kongo Falls",
      "Living Room",
      "Luigi's Mansion",
      "Lylat Cruise (Alt 1)",
      "Magicant",
      "Mario Circuit",
      "Midgar",
      "Minecraft World",
      "Minecraft World (Part 5)",
      "Mushroom Kingdom",
      "Paper Mario",
      "Pokemon Stadium",
      "Reset Bomb Forest",
      "Skyloft",
      "Snake Train Chamber (Part 2)",
      "Spiral Mountain",
      "Spring Stadium",
      "Summit",
      "Temple (Alt 1)",
      "Tomodachi Life",
      "Tortimer Island",
      "Umbra Clock Tower",
      "Wii Fit Studio",
      "Wily Castle",
    ].includes(name)
  ) {
    return true;
  }
  return false;
};

const legalFilterFunc = (name: string): boolean => {
  // unsupported stages always excluded
  if (unsupportedFilterFunc(name)) {
    return false;
  }
  // otherwise opposite of illegal stages
  if (illegalFilterFunc(name)) {
    return false;
  }
  return true;
};

const allFilterFunc = (name: string): boolean => {
  return true;
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
  b: LvdStats,
) => number;

const getSortSubtitle = (
  selectedSort: SortMode,
  selectedSortDir: SortDir,
  lvd: Lvd,
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
        0,
      );
      break;
    case SortMode.BZoneHeight:
      sortSub += (lvd.blast_zone[0]?.top - lvd.blast_zone[0]?.bottom).toFixed(
        0,
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
  b: LvdStats,
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
  b: LvdStats,
): number => {
  const mul = selectedSortDir === SortDir.Ascending ? 1 : -1;
  return (a.platNum - b.platNum) * mul;
};

const stageWidthCompareFn = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats,
): number => {
  const mul = selectedSortDir === SortDir.Ascending ? 1 : -1;
  return (a.stageWidth - b.stageWidth) * mul;
};

const blastzoneLeftCompareFn = (
  selectedSortDir: SortDir,
  lvdMap: Map<string, Lvd>,
  a: LvdStats,
  b: LvdStats,
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
  b: LvdStats,
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
  b: LvdStats,
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
  b: LvdStats,
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
  b: LvdStats,
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
  b: LvdStats,
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
  b: LvdStats,
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
  b: LvdStats,
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
  b: LvdStats,
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
  b: LvdStats,
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
  b: LvdStats,
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
  b: LvdStats,
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
  b: LvdStats,
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
  b: LvdStats,
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
