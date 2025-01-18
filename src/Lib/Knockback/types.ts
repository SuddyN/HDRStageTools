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
