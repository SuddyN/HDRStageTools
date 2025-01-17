import { AttackData, FighterData } from "./types";

const HITSTUN_RATIO = 0.42;
const CROUCH_CANCEL_KNOCKBACK_MUL = 2.0 / 3.0;
const SMASH_ATTACK_CHARGE_KNOCKBACK_MUL = 1.2;
const FLOOR_HUG_HITSTUN_MUL = 0.5;
const TUMBLE_THRESHOLD = 80.0;

function calculateKnockback(
  attackData: AttackData,
  fighterData: FighterData
): number {
  let { percent, weight } = fighterData;
  let { damage, kbg, fkb, bkb } = attackData;

  // https://www.ssbwiki.com/Knockback#Melee_onward
  if (fkb > 0.0) {
    damage = fkb;
    percent = 10.0;
  }

  let knockback = percent / 10 + (percent * damage) / 20;
  knockback *= (200 / (weight + 100)) * 1.4;
  knockback += 18;
  knockback *= kbg / 100;
  knockback += bkb;
  return knockback;
}

function modifyKnockback(
  knockback: number,
  isCrouchCancel: number,
  isSmashAttackCharge: number
): number {
  if (isCrouchCancel) {
    knockback *= CROUCH_CANCEL_KNOCKBACK_MUL;
  } else if (isSmashAttackCharge) {
    knockback *= SMASH_ATTACK_CHARGE_KNOCKBACK_MUL;
  }
  return knockback;
}

function calculateHitstun(knockback: number): number {
  return Math.floor(knockback * HITSTUN_RATIO);
}

function modifyHitstun(hitstun: number, isFloorHug: number): number {
  if (isFloorHug) {
    hitstun *= FLOOR_HUG_HITSTUN_MUL;
  }
  return Math.floor(hitstun);
}

export const knockbackService = {};
