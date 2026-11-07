export enum SizeTag {
  Small = "Small",
  Medium = "Medium",
  Large = "Large",
}

export enum TagCategory {
  StageWidth = "Stage Width",
  TopBZone = "Top Blastzone",
  SideBZone = "Side Blastzone",
  BottomBZone = "Bottom Blastzone",
}

export type StageTags = Record<TagCategory, SizeTag | undefined>;

export type TagSelection = Record<TagCategory, SizeTag[]>;
