import { Vec2 } from "../Lvd/types";
import { AttackData, FighterData } from "./types";

const HITSTUN_RATIO = 0.42;
const CROUCH_CANCEL_KNOCKBACK_MUL = 2.0 / 3.0;
const SMASH_ATTACK_CHARGE_KNOCKBACK_MUL = 1.2;
const FLOOR_HUG_HITSTUN_MUL = 0.5;
const DAMAGE_SPEED_MUL = 0.03;
const TUMBLE_THRESHOLD = 80.0;
const DAMAGE_FLY_TOP_RADIANS_LW = 1.22173;
const DAMAGE_FLY_TOP_RADIANS_HI = 1.919862;
const DAMAGE_AIR_BRAKE = 0.051;

function calcKnockback(
  attackData: AttackData,
  fighterData: FighterData
): number {
  let { percent, weight } = fighterData;
  let { damage, kbg, fkb, bkb } = attackData;
  percent += damage; // knockback is calculated with post-hit damage

  // if fixed knockback is used, attack damage is set to fkb and percent is set to 10
  if (fkb > 0.0) {
    damage = fkb;
    percent = 10.0;
  }

  // knockback formula
  // https://www.ssbwiki.com/Knockback#Melee_onward
  let knockback = percent / 10 + (percent * damage) / 20;
  knockback *= (200 / (weight + 100)) * 1.4;
  knockback += 18;
  knockback *= kbg / 100;
  knockback += bkb;
  return knockback;
}

function modifyKnockback(knockback: number, fighterData: FighterData): number {
  let { isCrouching, isChargingSmashAttack } = fighterData;
  if (isCrouching) {
    knockback *= CROUCH_CANCEL_KNOCKBACK_MUL;
  } else if (isChargingSmashAttack) {
    knockback *= SMASH_ATTACK_CHARGE_KNOCKBACK_MUL;
  }
  return knockback;
}

function calcHitstun(knockback: number): number {
  let hitstun = Math.floor(knockback * HITSTUN_RATIO);
  return hitstun;
}

function modifyHitstun(hitstun: number, isFloorHug: number): number {
  if (isFloorHug) {
    hitstun *= FLOOR_HUG_HITSTUN_MUL;
  }
  return Math.floor(hitstun);
}

function calcLaunchRadians(attackData: AttackData): number {
  let { angle } = attackData;
  if (!Number.isInteger(angle) || angle < 0 || angle > 361) {
    throw new Error("angle needs to be an integer between 0 and 361 inclusive");
  }
  if (angle === 361) {
    throw Error("not yet supported");
  }
  let radians = (angle * Math.PI) / 180;
  return radians;
}

function calcLaunchSpeed(
  knockback: number,
  launchRadians: number,
  attackData: AttackData,
  fighterData: FighterData
): Vec2 {
  // TODO: implement DI
  let magnitude = knockback * DAMAGE_SPEED_MUL;
  let launchSpeed = {
    x: magnitude * Math.cos(launchRadians),
    y: magnitude * Math.sin(launchRadians),
  };
  return launchSpeed;
}

export const knockbackService = {};

export class KnockbackCalcContext {
  attackData: AttackData;
  fighterData: FighterData;
  knockback: number;
  hitstun: number;
  launchRadians: number;
  launchSpeed: Vec2;
  yCharaSpeed: number;
  isTumble: boolean;
  isDamageFlyTop: boolean;
  pos: Vec2;
  posPrev: Vec2;
  decay: Vec2;
  speedUpMul: number;
  constructor(attackData: AttackData, fighterData: FighterData) {
    this.attackData = attackData;
    this.fighterData = fighterData;
    this.knockback = calcKnockback(this.attackData, this.fighterData);
    this.knockback = modifyKnockback(this.knockback, fighterData);
    this.hitstun = calcHitstun(this.knockback);
    this.launchRadians = calcLaunchRadians(this.attackData);
    this.launchSpeed = calcLaunchSpeed(
      this.knockback,
      this.launchRadians,
      this.attackData,
      this.fighterData
    );
    this.yCharaSpeed = 0;
    this.isTumble = this.knockback >= TUMBLE_THRESHOLD;
    this.isDamageFlyTop =
      this.launchRadians >= DAMAGE_FLY_TOP_RADIANS_LW &&
      this.launchRadians <= DAMAGE_FLY_TOP_RADIANS_HI;
    this.pos = { x: fighterData.startPos.x, y: fighterData.startPos.y };
    this.posPrev = { x: fighterData.startPos.x, y: fighterData.startPos.y };
    this.decay = {
      x: DAMAGE_AIR_BRAKE * Math.abs(Math.cos(this.launchRadians)),
      y: DAMAGE_AIR_BRAKE * Math.abs(Math.sin(this.launchRadians)),
    };
    this.speedUpMul = 1; // TODO: calculate this
  }

  step = () => {
    // TODO: step through knockback once
    this.posPrev.x = this.pos.x;
    this.posPrev.y = this.pos.y;
    this.pos.x += this.launchSpeed.x;
    this.pos.y += this.launchSpeed.y + this.yCharaSpeed;
    if (this.launchSpeed.x !== 0) {
      let dir = Math.sign(this.launchSpeed.x);
      this.launchSpeed.x = Math.abs(this.launchSpeed.x) - this.decay.x;
      if (this.launchSpeed.x < 0) {
        this.launchSpeed.x = 0;
      } else {
        this.launchSpeed.x *= dir;
      }
    }
    if (this.launchSpeed.y !== 0) {
      let dir = Math.sign(this.launchSpeed.y);
      this.launchSpeed.y = Math.abs(this.launchSpeed.y) - this.decay.y;
      if (this.launchSpeed.y < 0) {
        this.launchSpeed.y = 0;
      } else {
        this.launchSpeed.y *= dir;
      }
    }
    let gravity = this.isDamageFlyTop
      ? this.fighterData.gravityDamageFlyTop
      : this.fighterData.gravity;
    let fallSpeed = this.isDamageFlyTop
      ? this.fighterData.fallSpeedDamageFlyTop
      : this.fighterData.fallSpeed;
    this.yCharaSpeed = Math.max(this.yCharaSpeed - gravity, -fallSpeed);
  };

  calcTrajectory = (): Vec2[] => {
    let trajectory: Vec2[] = [];
    for (let f = this.hitstun; f > 0; f--) {
      trajectory.push({ x: this.pos.x, y: this.pos.y });
      this.step();
    }
    return trajectory;
  };
}
