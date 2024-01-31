import React, { ReactNode } from "react";
import logo from "../../logo.svg";
import "./App.css";
import { lvdService } from "../../Services/LvdService";
import { Boundary, Collision, Lvd, LvdStats } from "../../Types";
import { Checkbox } from "primereact/checkbox";
import { ListBox } from "primereact/listbox";
import { Dropdown } from "primereact/dropdown";
import { SelectButton } from "primereact/selectbutton";
import { attackService } from "../../Services/AttackService";

interface KnockbackCalculatorProps {}

interface KnockbackCalculatorState {
  percent: number; // percentage of the target
  damage: number; // damage of the attack
  weight: number; // weight of the target
  kbg: number; // knockback growth
  wdsk: number; // weight dependent set knockback
  bkb: number; // base knockback
  croundCancel: boolean;
  smashCharge: boolean;
}

export default class KnockbackCalculator extends React.Component<
  KnockbackCalculatorProps,
  KnockbackCalculatorState
> {
  constructor(props: KnockbackCalculatorProps) {
    super(props);
    this.state = {
      percent: 0,
      damage: 10,
      weight: 100,
      kbg: 100,
      wdsk: 0,
      bkb: 35,
      croundCancel: false,
      smashCharge: false,
    };
  }

  render() {
    let { percent, damage, weight, kbg, wdsk, bkb, croundCancel, smashCharge } =
      this.state;
    let knockback = attackService.calculateKnockback(
      percent,
      damage,
      weight,
      kbg,
      wdsk,
      bkb,
      croundCancel,
      smashCharge
    );
    let hitstun = attackService.calculateHitstun(knockback);
    return <></>;
  }
}
