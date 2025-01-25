import React, { ReactNode } from "react";
import { AttackData, FighterData } from "../../Lib/Knockback/types";
import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";
import { InputNumber } from "primereact/inputnumber";
import { Button } from "primereact/button";
import { DEFAULT_ATTACK } from "../StageTool";

interface KnockbackComparatorProps {
  fighterData: FighterData;
  attacks: AttackData[];
  setFighterData?: (fighterData: FighterData) => void;
  setAttacks?: (attacks: AttackData[]) => void;
}

interface KnockbackComparatorState {}

export default class KnockbackComparator extends React.Component<
  KnockbackComparatorProps,
  KnockbackComparatorState
> {
  constructor(props: KnockbackComparatorProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <>
        <Panel>
          <div className="font-small" style={{ maxWidth: "14rem" }}>
            For developers.
            <br />
            X=damage
            <br />
            Y=knockback
          </div>
        </Panel>
        <this.fighterPanel />
        <div className="p-panel p-component">
          <div className="p-panel-header justify-content-space-between">
            <Button
              label="Add Attack"
              style={{
                padding: "0.125rem 0.25rem",
                width: "100%",
                height: "100%",
              }}
              onClick={() =>
                this.props.setAttacks?.([...this.props.attacks, DEFAULT_ATTACK])
              }
            />
          </div>
        </div>
        {this.attackPanels()}
      </>
    );
  }

  fighterPanel = () => {
    const headerTemplate = (options: PanelHeaderTemplateOptions) => {
      const className = `${options.className} justify-content-space-between`;
      return (
        <div className={className}>
          <label htmlFor="percent" style={{ paddingRight: "0.25rem" }}>
            Defender Weight:
          </label>
          <InputNumber
            id="weight"
            value={fighterData.weight}
            onChange={(e) => {
              this.props.setFighterData?.({
                ...fighterData,
                weight: e.value ?? fighterData.weight,
              });
            }}
            min={0}
            max={200}
            minFractionDigits={0}
            maxFractionDigits={0}
            showButtons
            step={1}
          />
          {/* <div>{options.togglerElement}</div> */}
        </div>
      );
    };

    const { fighterData } = this.props;
    return (
      <Panel
        style={{
          textAlign: "start",
        }}
        headerTemplate={headerTemplate}
        toggleable
        collapsed
      ></Panel>
    );
  };

  attackPanels = () => {
    const attackPanel = (idx: number) => {
      const headerTemplate = (options: PanelHeaderTemplateOptions) => {
        const className = `${options.className} justify-content-space-between`;
        return (
          <div className={className}>
            <span>Attack {idx + 1}</span>

            <Button
              label="Remove"
              style={{
                padding: "0.125rem 0.25rem",
              }}
              onClick={() => {
                const attacks = this.props.attacks;
                attacks.splice(idx, 1);
                this.props.setAttacks?.(attacks);
              }}
            />
            <div>{options.togglerElement}</div>
          </div>
        );
      };

      const attackData = this.props.attacks[idx];
      return (
        <Panel
          style={{
            textAlign: "start",
          }}
          headerTemplate={headerTemplate}
          toggleable
        >
          <InputNumber
            id="damage"
            value={attackData.damage}
            onChange={(e) => {
              const attacks = [...this.props.attacks];
              attacks[idx] = {
                ...attacks[idx],
                damage: e.value ?? attacks[idx].damage,
              };
              this.props.setAttacks?.(attacks);
            }}
            min={0}
            max={999.9}
            minFractionDigits={1}
            maxFractionDigits={1}
            suffix="%"
            showButtons
            step={0.1}
          />
          <label htmlFor="damage" className="font-small">
            Damage
          </label>
          <br />
          <InputNumber
            id="kbg"
            value={attackData.kbg}
            onChange={(e) => {
              const attacks = [...this.props.attacks];
              attacks[idx] = {
                ...attacks[idx],
                kbg: e.value ?? attacks[idx].kbg,
              };
              this.props.setAttacks?.(attacks);
            }}
            min={0}
            max={1000}
            minFractionDigits={0}
            maxFractionDigits={0}
            showButtons
            step={1}
          />
          <label htmlFor="kbg" className="font-small">
            Knockback Growth
          </label>
          <br />
          <InputNumber
            id="fkb"
            value={attackData.fkb}
            onChange={(e) => {
              const attacks = [...this.props.attacks];
              attacks[idx] = {
                ...attacks[idx],
                fkb: e.value ?? attacks[idx].fkb,
              };
              this.props.setAttacks?.(attacks);
            }}
            min={0}
            max={1000}
            minFractionDigits={0}
            maxFractionDigits={0}
            showButtons
            step={1}
          />
          <label htmlFor="fkb" className="font-small">
            Fixed Knockback
          </label>
          <br />
          <InputNumber
            id="bkb"
            value={attackData.bkb}
            onChange={(e) => {
              const attacks = [...this.props.attacks];
              attacks[idx] = {
                ...attacks[idx],
                bkb: e.value ?? attacks[idx].bkb,
              };
              this.props.setAttacks?.(attacks);
            }}
            min={0}
            max={1000}
            minFractionDigits={0}
            maxFractionDigits={0}
            showButtons
            step={1}
          />
          <label htmlFor="bkb" className="font-small">
            Base Knockback
          </label>
        </Panel>
      );
    };
    let jsx: ReactNode[] = [];
    for (let i = 0; i < this.props.attacks.length; i++) {
      jsx.push(attackPanel(i));
    }
    return jsx;
  };
}
