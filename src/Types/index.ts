export interface Lvd {
    collisions: Collision[];
    spawns: Spawn[];
    respawns: Spawn[];
    camera_boundary: Boundary;
    blast_zone: Boundary;
    enemy_generators: number;
    // unk1
    // unk2
    // unk3
    // fs_area_cam
    // fs_cam_limit
    // damage_shapes
    item_spawners: ItemSpawner[];
    ptrainer_platforms: PTrainerPlatform[];
    // general_shapes
    // general_points
    // unk4
    // unk5
    // unk6
    // unk7
    shrunken_camera_boundary: Boundary;
    shrunken_blast_zone: Boundary;

}

export interface Collision {

}

export interface Spawn {

} 

export interface Boundary {

}

export interface ItemSpawner {

}

export interface PTrainerPlatform {

}

export interface Vec2 {
    x: number,
    y: number,
}

export interface Vec3 extends Vec2 {
    z: number
}