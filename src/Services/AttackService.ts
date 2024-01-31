const CROUCH_CANCEL_KNOCKBACK_MUL = 0.666667;
const SMASH_ATTACK_CHARGE_KNOCKBACK_MUL = 1.2;
const HITSTUN_RATIO = 0.42;
const TUMBLE_THRESHOLD = 80.0;

function calculateKnockback(
  percent: number, // percentage of the target
  damage: number, // damage of the attack
  weight: number, // weight of the target
  kbg: number, // knockback growth
  wdsk: number, // weight dependent set knockback
  bkb: number, // base knockback
  croundCancel: boolean,
  smashCharge: boolean
) {
  // https://www.ssbwiki.com/Knockback#Melee_onward
  let ratio = 1.0;
  if (croundCancel) ratio *= CROUCH_CANCEL_KNOCKBACK_MUL;
  if (smashCharge) ratio *= SMASH_ATTACK_CHARGE_KNOCKBACK_MUL;

  if (wdsk > 0.0) {
    damage = wdsk;
    percent = 10.0;
  }

  let knockback = percent / 10 + (percent * damage) / 20;
  knockback *= (200 / (weight + 100)) * 1.4;
  knockback += 18;
  knockback *= kbg;
  knockback += bkb;
  knockback *= ratio;
  return knockback;
}

function calculateHitstun(knockback: number) {
  let hitstun = knockback * HITSTUN_RATIO;
  return hitstun;
}

export const attackService = {
  HITSTUN_RATIO,
  TUMBLE_THRESHOLD,
  calculateKnockback,
  calculateHitstun,
};
