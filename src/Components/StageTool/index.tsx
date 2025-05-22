import React, { ReactNode } from "react";
import { Boundary, Collision, Lvd } from "../../Lib/Lvd/types";
import {
  stageListService,
  StageFilter,
  StageFilterFunc,
  SortMode,
  SortDir,
} from "../../Lib/StageList/services";
import { KnockbackCalcContext } from "../../Lib/Knockback/services";
import { AttackData, FighterData } from "../../Lib/Knockback/types";
import StageSelector from "../StageSelector";
import StageDrawOptions from "../StageDrawOptions";
import { Dropdown } from "primereact/dropdown";
import KnockbackViewer from "../KnockbackViewer";
import KnockbackComparator from "../KnockbackComparator";

enum Mode {
  HideSidebar = "Hide Sidebar",
  StageSelector = "Stage Selector",
  KnockbackViewer = "Knockback Viewer (BETA)",
  KnockbackComparator = "Knockback Comparator",
}

export const DEFAULT_FIGHTER: FighterData = {
  percent: 80,
  weight: 94,
  gravity: 0.095,
  gravityDamageFlyTop: 0.095,
  fallSpeed: 2.05,
  fallSpeedDamageFlyTop: 2.05,
  startPos: { x: 0, y: 0 },
  directionalInfluence: { x: 0, y: 0 },
  automaticSmashDirectionalInfluence: { x: 0, y: 0 },
  isGrounded: true,
  isCrouching: false,
  isChargingSmashAttack: false,
};

export const DEFAULT_ATTACK: AttackData = {
  damage: 13,
  angle: 45,
  kbg: 70,
  fkb: 0,
  bkb: 80,
};

interface StageToolProps {
  canvas: HTMLDivElement;
  calculator: Desmos.Calculator;
  loading: boolean;
  lvdMap: Map<string, Lvd>;
}

interface StageToolState {
  mode: Mode;
  fighterData: FighterData;
  attacks: AttackData[];
  drawStages: boolean;
  drawPlatforms: boolean;
  drawBlastZones: boolean;
  drawCameras: boolean;
  selectedFilter: StageFilter;
  selectedFilterFunc: StageFilterFunc;
  selectedStages: string[];
  selectedSort: SortMode;
  selectedSortDir: SortDir;
}

export default class StageTool extends React.Component<
  StageToolProps,
  StageToolState
> {
  constructor(props: StageToolProps) {
    super(props);
    this.state = {
      mode: Mode.StageSelector,
      fighterData: DEFAULT_FIGHTER,
      attacks: [],
      drawStages: true,
      drawPlatforms: true,
      drawBlastZones: true,
      drawCameras: false,
      selectedFilter: StageFilter.Legal,
      selectedFilterFunc: stageListService.getFilterFunc(StageFilter.Legal),
      selectedStages: [],
      selectedSort: SortMode.Name,
      selectedSortDir: SortDir.Ascending,
    };
  }

  draw = () => {
    if (this.state.mode === Mode.KnockbackComparator) {
      this.state.attacks.forEach((attackData, idx) => {
        this.drawKnockbackPlot(attackData, this.state.fighterData, idx);
      });
      return;
    }

    // draw knockback
    this.state.attacks.forEach((attackData, idx) => {
      this.drawKnockbackInstance(attackData, this.state.fighterData, idx);
    });

    // draw stages
    this.props.lvdMap.forEach((lvd, name) => {
      const idx = this.state.selectedStages.findIndex(
        (other) => name === other
      );
      if (idx < 0) {
        return;
      }
      this.drawStage(name, lvd, idx);
    });
  };

  drawKnockbackPlot = (
    attackData: AttackData,
    fighterData: FighterData,
    idx: number
  ) => {
    let { damage, kbg, fkb, bkb } = attackData;
    let { weight } = fighterData;
    let x = `x+${damage}`;
    if (fkb > 0.0) {
      damage = fkb;
      x = "10";
    }
    let latex = `y=\\left(\\left(\\left(\\left(\\left(\\frac{${x}}{10}+\\left(${x}\\right)\\cdot\\frac{${damage}}{20}\\right)\\cdot\\frac{200}{${weight}+100}\\cdot1.4\\right)+18\\right)\\cdot${
      kbg / 100
    }\\right)+${bkb}\\right)`;
    this.props.calculator.setExpression({
      type: "expression",
      showLabel: true,
      latex,
      lineStyle: Desmos.Styles.SOLID,
      lineWidth: 1.0,
      lines: true,
      points: false,
      color: makeHexFromHueIndex(idx, this.state.attacks.length, true),
    });
  };

  drawKnockbackInstance = (
    attackData: AttackData,
    fighterData: FighterData,
    idx: number
  ) => {
    let knockbackCalcContext = new KnockbackCalcContext(
      attackData,
      fighterData
    );
    let trajectory = knockbackCalcContext.calcTrajectory();
    let xValues: string[] = trajectory.map((t) => t.x.toString());
    let yValues: string[] = trajectory.map((t) => t.y.toString());
    console.log(trajectory);

    this.props.calculator.setExpression({
      type: "table",
      columns: [
        {
          latex: "x",
          values: xValues,
          points: true,
          lines: true,
          lineWidth: 1.0,
          pointSize: 3,
        },
        {
          latex: "y",
          values: yValues,
          points: true,
          lines: true,
          lineWidth: 1.0,
          pointSize: 3,
          color: makeHexFromHueIndex(idx, this.state.attacks.length, true),
        },
      ],
    });
  };

  drawStage = (name: string, lvd: Lvd, idx: number) => {
    // // draw blast_zones
    if (this.state.drawBlastZones && lvd.blast_zone[0]) {
      this.drawBoundary(name, lvd.blast_zone[0], idx);
    }
    // // draw camera_boundary
    if (this.state.drawCameras && lvd.camera_boundary[0]) {
      this.drawBoundary(name, lvd.camera_boundary[0], idx, true);
    }
    for (const collision of lvd.collisions) {
      if (collision.col_flags.drop_through) {
        // platform
        if (this.state.drawPlatforms) {
          this.drawCollision(name, collision, idx, true);
        }
      } else {
        // stage
        if (this.state.drawStages) {
          this.drawCollision(name, collision, idx);
        }
      }
    }
  };

  drawBoundary = (
    name: string,
    boundary: Boundary,
    idx: number,
    isCamera?: boolean
  ) => {
    const { left, right, bottom, top } = boundary;
    this.props.calculator.setExpression({
      type: "table",
      columns: [
        {
          latex: "x",
          values: [left, right, right, left, left].map((e) => e.toString()),
          points: true,
          lines: true,
          lineWidth: 1.0,
          pointSize: 3,
          lineStyle: isCamera ? Desmos.Styles.DOTTED : Desmos.Styles.DASHED,
          color: makeHexFromHueIndex(
            idx,
            this.state.selectedStages.length,
            true
          ),
        },
        {
          latex: "y",
          values: [top, top, bottom, bottom, top].map((e) => e.toString()),
          points: true,
          lines: true,
          lineWidth: 1.0,
          pointSize: 3,
          lineStyle: isCamera ? Desmos.Styles.DOTTED : Desmos.Styles.DASHED,
          color: makeHexFromHueIndex(
            idx,
            this.state.selectedStages.length,
            true
          ),
        },
      ],
    });
  };

  drawCollision = (
    name: string,
    collision: Collision,
    idx: number,
    isPlatform?: boolean
  ) => {
    const xValues = collision.vertices.map(
      (vertex) => vertex.x + collision.entry.start_pos.x
    );
    const yValues = collision.vertices.map(
      (vertex) => vertex.y + collision.entry.start_pos.y
    );
    xValues.push(xValues[0]);
    yValues.push(yValues[0]);

    this.props.calculator.setExpression({
      type: "table",
      columns: [
        {
          latex: "x",
          values: xValues.map((e) => e.toString()),
          points: true,
          lines: true,
          lineWidth: isPlatform ? 1.0 : 1.6,
          pointSize: isPlatform ? 3 : 4,
          color: makeHexFromHueIndex(
            idx,
            this.state.selectedStages.length,
            true
          ),
        },
        {
          latex: "y",
          values: yValues.map((e) => e.toString()),
          points: true,
          lines: true,
          lineWidth: isPlatform ? 1.0 : 1.6,
          pointSize: isPlatform ? 3 : 4,
          color: makeHexFromHueIndex(
            idx,
            this.state.selectedStages.length,
            true
          ),
        },
      ],
    });
  };

  async componentDidMount(): Promise<void> {
    this.calculatorRender();
  }

  calculatorRender() {
    this.props.calculator.setBlank();
    this.draw();
    const scale = 250;
    const verticalOffset = 50;
    const ratio =
      this.props.canvas.offsetHeight / this.props.canvas.offsetWidth;
    const horizontalRatio = ratio > 1 ? 1 : 1 / ratio;
    const verticalRatio = ratio < 1 ? 1 : ratio;
    this.props.calculator.setMathBounds({
      left: -scale * horizontalRatio,
      right: scale * horizontalRatio,
      bottom: (verticalOffset - scale) * verticalRatio,
      top: (verticalOffset + scale) * verticalRatio,
    });
  }

  render() {
    if (this.props.loading) {
      return <></>;
    }
    this.calculatorRender();

    return (
      <>
        <div className="sidebar-left">
          <Dropdown
            className="listbox-sorter"
            value={this.state.mode}
            options={Object.values(Mode)}
            onChange={(e) => this.setState({ mode: e.target.value })}
          />
          {this.state.mode === Mode.StageSelector && (
            <StageSelector
              lvdSorter={this.lvdSorter}
              selectedFilter={this.state.selectedFilter}
              selectedFilterFunc={this.state.selectedFilterFunc}
              selectedSort={this.state.selectedSort}
              selectedSortDir={this.state.selectedSortDir}
              selectedStages={this.state.selectedStages}
              onChangeFilter={(e) => {
                this.setState({
                  selectedFilter: e.value,
                  selectedFilterFunc: stageListService.getFilterFunc(e.value),
                });
              }}
              onChangeSort={(e) => this.setState({ selectedSort: e.value })}
              onChangeSortDir={(e) =>
                this.setState({ selectedSortDir: e.value })
              }
              onChangeStages={(e) => this.setState({ selectedStages: e.value })}
              groupedSorters={this.groupedSorters}
              stageListTemplate={this.stageListTemplate}
            />
          )}
          {this.state.mode === Mode.KnockbackViewer && (
            <KnockbackViewer
              fighterData={this.state.fighterData}
              attacks={this.state.attacks}
              setFighterData={(f) => this.setState({ fighterData: f })}
              setAttacks={(a) => this.setState({ attacks: a })}
            />
          )}
          {this.state.mode === Mode.KnockbackComparator && (
            <KnockbackComparator
              fighterData={this.state.fighterData}
              attacks={this.state.attacks}
              setFighterData={(f) => this.setState({ fighterData: f })}
              setAttacks={(a) => this.setState({ attacks: a })}
            />
          )}
        </div>
        <div className="sidebar-right">
          <StageDrawOptions
            drawStages={this.state.drawStages}
            drawPlatforms={this.state.drawPlatforms}
            drawBlastZones={this.state.drawBlastZones}
            drawCameras={this.state.drawCameras}
            onChangeStages={(e) => {
              this.setState({ drawStages: e.checked ?? true });
            }}
            onChangePlatforms={(e) => {
              this.setState({ drawPlatforms: e.checked ?? true });
            }}
            onChangeBlastzones={(e) => {
              this.setState({ drawBlastZones: e.checked ?? true });
            }}
            onChangeCameras={(e) => {
              this.setState({ drawCameras: e.checked ?? false });
            }}
          />
        </div>
      </>
    );
  }

  createSortLabels = (values: string[]): { label: string; value: string }[] => {
    return values.map((v) => ({ label: v, value: v }));
  };

  groupedSorters = [
    {
      label: "General",
      items: this.createSortLabels([SortMode.Name, SortMode.StageWidth]),
    },
    {
      label: "Platforms",
      items: this.createSortLabels([
        SortMode.PlatCount,
        SortMode.PlatHeight,
        SortMode.PlatHeightSpan,
        SortMode.PlatWidthSpan,
      ]),
    },
    {
      label: "Blastzones",
      items: this.createSortLabels([
        SortMode.BZoneLeft,
        SortMode.BZoneRight,
        SortMode.BZoneTop,
        SortMode.BZoneBottom,
        SortMode.BZoneWidth,
        SortMode.BZoneHeight,
        SortMode.StageToBZoneLeft,
        SortMode.StageToBZoneRight,
        SortMode.PlatToBZoneTopMin,
        SortMode.PlatToBZoneTopMax,
      ]),
    },
  ];

  stageListTemplate = (selectedStage: string): ReactNode => {
    const idx = this.state.selectedStages.findIndex(
      (other) => selectedStage === other
    );
    const hslaStr =
      idx >= 0
        ? makeHexFromHueIndex(idx, this.state.selectedStages.length)
        : "#FFFFFF";

    const lvd = this.props.lvdMap.get(selectedStage);
    if (!lvd?.lvdStats) {
      return selectedStage;
    }
    const stageSubtitle = stageListService.getSortSubtitle(
      this.state.selectedSort,
      this.state.selectedSortDir,
      lvd
    );

    return (
      <>
        <div style={{ color: hslaStr }}>{selectedStage}</div>
        <div style={{ fontSize: "75%" }}>{stageSubtitle}</div>
      </>
    );
  };

  lvdSorter = (): string[] => {
    const { lvdMap } = this.props;
    const { selectedSort } = this.state;
    let lvdStatsArray = Array.from(lvdMap.entries()).flatMap((entry) => {
      if (!entry[1].lvdStats || !this.state.selectedFilterFunc(entry[0])) {
        return [];
      }
      return [entry[1].lvdStats];
    });

    // sort
    let compareFn = stageListService.getSortFunc(selectedSort);
    lvdStatsArray = lvdStatsArray.sort(
      compareFn.bind(this, this.state.selectedSortDir, lvdMap)
    );

    return lvdStatsArray.map((e) => e.name); // map to string arr
  };
}

export const makeHexFromHueIndex = (
  idx: number,
  length: number,
  invertedColors?: boolean
) => {
  const h = (idx * 360) / length;
  const l = 66 / 100;
  const a = (100 * Math.min(l, 1 - l)) / 100;
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0"); // convert to Hex and prefix "0" if needed
  };
  const hex = `${f(0)}${f(8)}${f(4)}`.toUpperCase();
  if (invertedColors) {
    const newHex = (Number(`0x1${hex}`) ^ 0xffffff)
      .toString(16)
      .substr(1)
      .toUpperCase();
    return `#${newHex}`;
  }
  return `#${hex}`;
};
