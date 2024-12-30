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

export const stageListService = {
  legalFilterFunc,
  supportedFilterFunc,
  gigaton2FilterFunc,
};
