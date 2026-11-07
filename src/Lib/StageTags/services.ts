import { Lvd } from "../Lvd/types";
import { SizeTag, StageTags, TagCategory, TagSelection } from "./types";

// Small: v < lo, Medium: lo <= v <= hi, Large: v > hi
export const TAG_THRESHOLDS: Record<TagCategory, { lo: number; hi: number }> = {
  [TagCategory.StageWidth]: { lo: 137, hi: 148 },
  [TagCategory.TopBZone]: { lo: 185, hi: 195 },
  [TagCategory.SideBZone]: { lo: 145, hi: 155 },
  [TagCategory.BottomBZone]: { lo: 110, hi: 120 },
};

export const TAG_COLORS: Record<SizeTag, string> = {
  [SizeTag.Small]: "#E05555",
  [SizeTag.Medium]: "#E0C040",
  [SizeTag.Large]: "#A060E0",
};

const classify = (
  value: number | undefined,
  category: TagCategory,
): SizeTag | undefined => {
  if (value === undefined || !Number.isFinite(value)) {
    return undefined;
  }
  const { lo, hi } = TAG_THRESHOLDS[category];
  if (value < lo) return SizeTag.Small;
  if (value > hi) return SizeTag.Large;
  return SizeTag.Medium;
};

const getTagValue = (lvd: Lvd, category: TagCategory): number | undefined => {
  const stats = lvd.lvdStats;
  const bz = lvd.blast_zone[0];
  let value: number | undefined;
  switch (category) {
    case TagCategory.StageWidth:
      value = stats && stats.stageWidth > 0 ? stats.stageWidth : undefined;
      break;
    case TagCategory.TopBZone:
      value = bz?.top;
      break;
    case TagCategory.SideBZone:
      if (bz && stats) {
        const left = stats.stageMinX - bz.left;
        const right = bz.right - stats.stageMaxX;
        value = (left + right) / 2;
      }
      break;
    case TagCategory.BottomBZone:
      value = bz ? -bz.bottom : undefined;
      break;
  }
  return value !== undefined && Number.isFinite(value) ? value : undefined;
};

const getStageTags = (lvd: Lvd): StageTags => {
  const tags = {} as StageTags;
  Object.values(TagCategory).forEach((category) => {
    tags[category] = classify(getTagValue(lvd, category), category);
  });
  return tags;
};

const emptySelection = (): TagSelection => {
  const sel = {} as TagSelection;
  Object.values(TagCategory).forEach((category) => {
    sel[category] = [];
  });
  return sel;
};

const matchesSelection = (tags: StageTags, sel: TagSelection): boolean => {
  return Object.values(TagCategory).every(
    (category) =>
      sel[category].length === 0 ||
      (tags[category] !== undefined &&
        sel[category].includes(tags[category] as SizeTag)),
  );
};

export const stageTagService = {
  classify,
  getTagValue,
  getStageTags,
  emptySelection,
  matchesSelection,
};
