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
    entry: Entry;
    col_flags: ColFlags;
    vertices: Vec2[];
    normals: Vec2[];
    // cliffs
    materials: Material[];
    // unknowns
}

export interface Entry {
    name: string,
    subname: string,
    start_pos: Vec3,
    use_start: boolean,
    // unk
    // unk2
    // unk3
    bone_name: string,
}

export interface ColFlags {
    flag1: boolean;
    rig_col: boolean;
    flag3: boolean;
    drop_through: false;
}

export interface Material {
    line_material: string;
    line_flags: LineFlags;
}

export interface LineFlags {
    length_zero: boolean;
    pacman_final_ignore: boolean;
    fall: boolean;
    ignore_ray_check: boolean;
    dive: boolean;
    unpaintable: boolean;
    item: boolean;
    ignore_fighter_other: boolean;
    right: boolean;
    left: boolean;
    upper: boolean;
    under: boolean;
    not_attach: boolean;
    throughable: boolean;
    hang_l: boolean;
    hang_r: boolean;
    ignore_link_from_left: boolean;
    cloud: boolean;
    ignore_link_from_right: boolean;
    not_expand_near_search: boolean;
    ignore: boolean;
    breakable: boolean;
    immediate_relanding_ban: boolean;
    ignore_line_type1: boolean;
    pickel_block: boolean;
    deceleration: boolean;
    virtual_hit_line_up: boolean;
    virtual_hit_line_left: boolean;
    virtual_hit_line_right: boolean;
    virtual_hit_line_down: boolean;
    virtual_wall_hit_line: boolean;
    ignore_boss: boolean;
}

export interface Spawn {
    entry: Entry;
    pos: Vec2;
} 

export interface Boundary {
    entry: Entry;
    left: number;
    right: number;
    top: number;
    bottom: number;
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