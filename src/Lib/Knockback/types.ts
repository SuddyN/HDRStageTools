import { Vec2 } from "../Lvd/types";

export interface FighterData {
  percent: number;
  weight: number;
  gravity: number;
  gravityDamageFlyTop: number;
  fallSpeed: number;
  fallSpeedDamageFlyTop: number;
  startPos: Vec2;
  directionalInfluence: Vec2;
  automaticSmashDirectionalInfluence: Vec2;
  isGrounded: boolean;
  isCrouching: boolean;
  isChargingSmashAttack: boolean;
}

export interface AttackData {
  damage: number;
  angle: number;
  kbg: number;
  fkb: number;
  bkb: number;
}

export interface KnockbackCalcData {
  attackData: AttackData;
  fighterData: FighterData;
  knockback: number;
  hitstun: number;
  launchSpeed: Vec2;
  yCharaSpeed: number;
  isTumble: boolean;
  isDamageFlyTop: boolean;
  pos: Vec2;
  posPrev: Vec2;
  decay: Vec2;
  speedUpMul: number;
}

export class KnockbackCalcData implements KnockbackCalcData {
  constructor(attackData: AttackData, fighterData: FighterData) {
    this.attackData = attackData;
    this.fighterData = fighterData;
    this.knockback = 0;
    this.hitstun = 0;
    this.launchSpeed = { x: 0, y: 0 };
    this.yCharaSpeed = 0;
    this.isTumble = false;
    this.isDamageFlyTop = false;
    this.pos = { x: 0, y: 0 };
    this.posPrev = { x: 0, y: 0 };
    this.decay = { x: 0, y: 0 };
    this.speedUpMul = 0;
  }

  initKnockbackCalcData = (
    attackData: AttackData,
    fighterData: FighterData
  ) => {
    // TODO: initialize knockback calc data
  };

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
    this.launchSpeed.y = Math.max(this.launchSpeed.y - gravity, -fallSpeed);
  };

  calculateTrajectory = (): Vec2[] => {
    // TODO: return an array of positions
    return [];
  };
}
