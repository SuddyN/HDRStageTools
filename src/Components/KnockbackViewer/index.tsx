import React, { ReactNode } from "react";
import { ListBox, ListBoxChangeEvent } from "primereact/listbox";
import { Dropdown, DropdownChangeEvent } from "primereact/dropdown";
import { SelectButton, SelectButtonChangeEvent } from "primereact/selectbutton";
import {
  StageFilter,
  StageFilterFunc,
  SortMode,
  SortDir,
} from "../../Lib/StageList/services";
import { AttackData, FighterData } from "../../Lib/Knockback/types";
import { Panel, PanelHeaderTemplateOptions } from "primereact/panel";
import { Avatar } from "primereact/avatar";
import { Menu } from "primereact/menu";
import { InputNumber } from "primereact/inputnumber";
import { FloatLabel } from "primereact/floatlabel";

interface KnockbackViewerProps {
  fighterData: FighterData;
  attacks: AttackData[];
  setFighterData?: (fighterData: FighterData) => void;
  setAttacks?: (attacks: AttackData[]) => void;
}

interface KnockbackViewerState {}

export default class KnockbackViewer extends React.Component<
  KnockbackViewerProps,
  KnockbackViewerState
> {
  constructor(props: KnockbackViewerProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <>
        <this.fighterPanel />
        {this.attackPanels()}
      </>
    );
  }

  fighterPanel = () => {
    const headerTemplate = (options: PanelHeaderTemplateOptions) => {
      const className = `${options.className} justify-content-space-between`;
      return (
        <div className={className}>
          <span>Fighter Data</span>
          <div>{options.togglerElement}</div>
        </div>
      );
    };

    const { fighterData } = this.props;
    return (
      <Panel headerTemplate={headerTemplate} toggleable>
        <InputNumber
          id="percent"
          value={fighterData.percent}
          onChange={(e) => {
            this.props.setFighterData?.({
              ...fighterData,
              percent: e.value ?? fighterData.percent,
            });
          }}
          min={0}
          max={999.9}
        />
        <label htmlFor="percent"> Percent</label>
        <br />
        <InputNumber
          id="weight"
          value={fighterData.weight}
          onChange={(e) => {
            this.props.setFighterData?.({
              ...fighterData,
              weight: e.value ?? fighterData.weight,
            });
          }}
        />
        <label htmlFor="weight"> Weight</label>
        <br />
        <InputNumber
          id="gravity"
          value={fighterData.gravity}
          onChange={(e) => {
            this.props.setFighterData?.({
              ...fighterData,
              gravity: e.value ?? fighterData.gravity,
            });
          }}
        />
        <label htmlFor="gravity"> Gravity</label>
        <br />
        <InputNumber
          id="gravityDamageFlyTop"
          value={fighterData.gravityDamageFlyTop}
          onChange={(e) => {
            this.props.setFighterData?.({
              ...fighterData,
              gravityDamageFlyTop: e.value ?? fighterData.gravityDamageFlyTop,
            });
          }}
        />
        <label htmlFor="gravityDamageFlyTop"> Gravity (Tumble)</label>
        <br />
        <InputNumber
          id="fallSpeed"
          value={fighterData.fallSpeed}
          onChange={(e) => {
            this.props.setFighterData?.({
              ...fighterData,
              fallSpeed: e.value ?? fighterData.fallSpeed,
            });
          }}
        />
        <label htmlFor="fallSpeed"> Fall Speed</label>
        <br />
        <InputNumber
          id="fallSpeedDamageFlyTop"
          value={fighterData.fallSpeedDamageFlyTop}
          onChange={(e) => {
            this.props.setFighterData?.({
              ...fighterData,
              fallSpeedDamageFlyTop:
                e.value ?? fighterData.fallSpeedDamageFlyTop,
            });
          }}
        />
        <label htmlFor="fallSpeedDamageFlyTop"> Fall Speed (Tumble)</label>
      </Panel>
    );
  };

  attackPanels = () => {
    const attackPanel = (idx: number) => {
      const headerTemplate = (options: PanelHeaderTemplateOptions) => {
        const className = `${options.className} justify-content-space-between`;
        return (
          <div className={className}>
            <span>Attack {idx + 1}</span>
            <div>{options.togglerElement}</div>
          </div>
        );
      };

      const attackData = this.props.attacks[idx];
      return (
        <Panel headerTemplate={headerTemplate} toggleable>
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
          />
          <label htmlFor="damage"> Damage</label>
          <br />
          <InputNumber
            id="angle"
            value={attackData.angle}
            onChange={(e) => {
              const attacks = [...this.props.attacks];
              attacks[idx] = {
                ...attacks[idx],
                angle: e.value ?? attacks[idx].angle,
              };
              this.props.setAttacks?.(attacks);
            }}
          />
          <label htmlFor="angle"> Angle</label>
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
          />
          <label htmlFor="kbg"> Knockback Growth</label>
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
          />
          <label htmlFor="fkb"> Fixed Knockback</label>
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
          />
          <label htmlFor="bkb"> Base Knockback</label>
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
