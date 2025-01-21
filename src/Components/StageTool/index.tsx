import React, { ReactNode } from "react";
import { Boundary, Collision, Lvd } from "../../Lib/Lvd/types";
import { Checkbox } from "primereact/checkbox";
import { ListBox } from "primereact/listbox";
import { Dropdown } from "primereact/dropdown";
import { SelectButton } from "primereact/selectbutton";
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

interface StageToolProps {
  canvas: HTMLDivElement;
  calculator: Desmos.Calculator;
  loading: boolean;
  lvdMap: Map<string, Lvd>;
}

interface StageToolState {
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
    this.props.lvdMap.forEach((lvd, name) => {
      const idx = this.state.selectedStages.findIndex(
        (other) => name === other
      );
      if (idx < 0) {
        return;
      }
      this.drawStage(name, lvd, idx);
    });

    // temp
    let attackData: AttackData = {
      damage: 13,
      angle: 45,
      kbg: 70,
      fkb: 0,
      bkb: 80,
    };
    let fighterData: FighterData = {
      percent: 100,
      weight: 98,
      gravity: 0.095,
      gravityDamageFlyTop: 0.095,
      fallSpeed: 1.8,
      fallSpeedDamageFlyTop: 1.8,
      startPos: { x: 0, y: 0 },
      directionalInfluence: { x: 0, y: 0 },
      automaticSmashDirectionalInfluence: { x: 0, y: 0 },
      isGrounded: true,
      isCrouching: false,
      isChargingSmashAttack: false,
    };
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
          color: this.makeHexFromHueIndex(idx, true),
        },
        {
          latex: "y",
          values: [top, top, bottom, bottom, top].map((e) => e.toString()),
          points: true,
          lines: true,
          lineWidth: 1.0,
          pointSize: 3,
          lineStyle: isCamera ? Desmos.Styles.DOTTED : Desmos.Styles.DASHED,
          color: this.makeHexFromHueIndex(idx, true),
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
          color: this.makeHexFromHueIndex(idx, true),
        },
        {
          latex: "y",
          values: yValues.map((e) => e.toString()),
          points: true,
          lines: true,
          lineWidth: isPlatform ? 1.0 : 1.6,
          pointSize: isPlatform ? 3 : 4,
          color: this.makeHexFromHueIndex(idx, true),
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
            onChangeSortDir={(e) => this.setState({ selectedSortDir: e.value })}
            onChangeStages={(e) => this.setState({ selectedStages: e.value })}
            groupedSorters={this.groupedSorters}
            stageListTemplate={this.stageListTemplate}
          />
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

  makeHexFromHueIndex = (idx: number, invertedColors?: boolean) => {
    const h = (idx * 360) / this.state.selectedStages.length;
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

  stageListTemplate = (selectedStage: string): ReactNode => {
    const idx = this.state.selectedStages.findIndex(
      (other) => selectedStage === other
    );
    const hslaStr = idx >= 0 ? this.makeHexFromHueIndex(idx) : "#FFFFFF";

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
