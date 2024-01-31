import React, { ReactNode } from "react";
import "mafs/core.css";
import "./KnockbackCalculator.css";
import { attackService } from "../../Services/AttackService";
import { Coordinates, Mafs, Plot, Theme, Text, Debug } from "mafs";
import { InputNumber } from "primereact/inputnumber";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";

interface KnockbackCalculatorProps {
  onToggle: (e: CheckboxChangeEvent) => void;
  plotWidth: number;
  plotHeight: number;
}

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
    return (
      <>
        <div
          className="sidebar-left"
          style={{
            background: "rgba(0, 0, 0, 0.95)",
            borderRadius: "1rem",
          }}
        >
          <div className="sidebar-item">
            <Checkbox checked={true} onChange={this.props.onToggle} />
            <label> Show Knockback Calculator? </label>
          </div>
          <div style={{ marginBottom: "0.5rem" }} />
          <div className="sidebar-item">
            <InputNumber
              value={weight}
              onValueChange={(e) => this.setState({ weight: e.value ?? 0 })}
              min={0}
              max={999.9}
              minFractionDigits={0}
              maxFractionDigits={0}
              mode="decimal"
              showButtons
            />
            <label> Weight </label>
          </div>
          <div className="sidebar-item">
            <InputNumber
              value={damage}
              onValueChange={(e) => this.setState({ damage: e.value ?? 0 })}
              min={0}
              max={999.9}
              minFractionDigits={1}
              maxFractionDigits={2}
              mode="decimal"
              showButtons
            />
            <label> Damage </label>
          </div>
          <div className="sidebar-item">
            <InputNumber
              value={kbg}
              onValueChange={(e) => this.setState({ kbg: e.value ?? 0 })}
              min={0}
              max={999.9}
              minFractionDigits={0}
              maxFractionDigits={0}
              mode="decimal"
              showButtons
            />
            <label> Knockback Growth </label>
          </div>
          <div className="sidebar-item">
            <InputNumber
              value={wdsk}
              onValueChange={(e) => this.setState({ wdsk: e.value ?? 0 })}
              min={0}
              max={999.9}
              minFractionDigits={0}
              maxFractionDigits={0}
              mode="decimal"
              showButtons
            />
            <label> Set Knockback </label>
          </div>
          <div className="sidebar-item">
            <InputNumber
              value={bkb}
              onValueChange={(e) => this.setState({ bkb: e.value ?? 0 })}
              min={0}
              max={999.9}
              minFractionDigits={0}
              maxFractionDigits={0}
              mode="decimal"
              showButtons
            />
            <label> Base Knockback </label>
          </div>
          <div className="sidebar-item">
            <Checkbox
              checked={croundCancel}
              onChange={(e) =>
                this.setState({
                  croundCancel: e.checked ?? false,
                  smashCharge: false,
                })
              }
            />
            <label> Is Crouch Canceling? </label>
          </div>
          <div className="sidebar-item">
            <Checkbox
              checked={smashCharge}
              onChange={(e) =>
                this.setState({
                  smashCharge: e.checked ?? false,
                  croundCancel: false,
                })
              }
            />
            <label> Is Charging Smash Attack? </label>
          </div>
        </div>
        <Mafs
          viewBox={{ x: [0, 300] }}
          zoom
          width={this.props.plotWidth}
          height={this.props.plotHeight}
        >
          <Debug.ViewportInfo />
          <Coordinates.Cartesian
            xAxis={{ lines: 10 }}
            yAxis={{
              lines: 10,
              labels: (n) =>
                n == attackService.TUMBLE_THRESHOLD
                  ? `${n} (Tumble Threshold)`
                  : n,
            }}
            subdivisions={10}
          />
          <Plot.OfX
            y={(y) => {
              return attackService.calculateKnockback(
                y,
                damage,
                weight,
                kbg,
                wdsk,
                bkb,
                croundCancel,
                smashCharge
              );
            }}
            color={Theme.blue}
            maxSamplingDepth={1}
          />
          <Plot.OfX
            y={(y) => {
              let knockback = attackService.calculateKnockback(
                y,
                damage,
                weight,
                kbg,
                wdsk,
                bkb,
                croundCancel,
                smashCharge
              );
              let hitstun = attackService.calculateHitstun(
                knockback,
                croundCancel
              );
              return Math.ceil(hitstun);
            }}
            color={Theme.yellow}
            minSamplingDepth={10}
          />
          {/* <Plot.OfX
            y={(y) => {
              return attackService.TUMBLE_THRESHOLD;
            }}
            color={Theme.pink}
          /> */}
        </Mafs>
      </>
    );
  }
}
