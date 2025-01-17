import React, { ReactNode } from "react";
import logo from "../../logo.svg";
import "./App.css";
import { lvdService } from "../../Services/LvdService";
import { Boundary, Collision, Lvd } from "../../Types";
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
} from "../../Services/StageListService";
import { elt, GraphingCalculator } from "desmos-react";

const LVD_SOURCE: string = "./lvd/hdr-beta/lvd.zip";

interface AppProps {}

interface DrawOptions {
  debug: boolean;
  drawCameras: boolean;
  drawBlastZones: boolean;
  drawPlatforms: boolean;
  drawStages: boolean;
  drawSpawns: boolean;
  drawRespawns: boolean;
  drawItemSpawners: boolean;
  drawPTrainerPlatforms: boolean;
  drawShrunkenCameras: boolean;
  drawShrunkenBlastZones: boolean;
}

interface AppState extends DrawOptions {
  selectedFilter: StageFilter;
  selectedFilterFunc: StageFilterFunc;
  selectedStages: string[];
  selectedSort: SortMode;
  selectedSortDir: SortDir;
  loading: boolean;
  lvdMap: Map<string, Lvd>;
  lvdSource: string;
}

export default class App extends React.Component<AppProps, AppState> {
  canvas: HTMLDivElement | null = null;
  calculator: any = null;

  constructor(props: AppProps) {
    super(props);
    this.state = {
      debug: false,
      drawCameras: false,
      drawBlastZones: true,
      drawPlatforms: true,
      drawStages: true,
      drawSpawns: false,
      drawRespawns: false,
      drawItemSpawners: false,
      drawPTrainerPlatforms: false,
      drawShrunkenCameras: false,
      drawShrunkenBlastZones: false,
      selectedFilter: StageFilter.Legal,
      selectedFilterFunc: stageListService.getFilterFunc(StageFilter.Legal),
      selectedStages: [],
      selectedSort: SortMode.Name,
      selectedSortDir: SortDir.Ascending,
      loading: true,
      lvdMap: new Map<string, Lvd>(),
      lvdSource: LVD_SOURCE,
    };
  }

  resize = () => {
    this.forceUpdate();
  };

  draw = () => {
    if (!this.calculator) {
      return;
    }
    this.state.lvdMap.forEach((lvd, name) => {
      const idx = this.state.selectedStages.findIndex(
        (other) => name === other
      );
      if (idx < 0) {
        return;
      }
      this.drawStage(name, lvd, idx);
    });
  };

  drawStage = (name: string, lvd: Lvd, idx: number) => {
    if (!this.calculator) {
      return;
    }

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
    if (!this.calculator) {
      return;
    }

    const { left, right, bottom, top } = boundary;
    this.calculator.setExpression({
      type: "table",
      label: name,
      showLabel: true,
      columns: [
        {
          latex: "x",
          label: name,
          showLabel: true,
          values: [left, right, right, left, left],
          points: true,
          lines: true,
          lineWidth: 1.0,
          pointSize: 3,
          lineStyle: isCamera ? Desmos.Styles.DOTTED : Desmos.Styles.DASHED,
          color: this.makeHexFromHueIndex(idx, true),
        },
        {
          latex: "y",
          label: name,
          showLabel: true,
          values: [top, top, bottom, bottom, top],
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
    if (!this.calculator) {
      return;
    }

    const xValues = collision.vertices.map(
      (vertex) => vertex.x + collision.entry.start_pos.x
    );
    const yValues = collision.vertices.map(
      (vertex) => vertex.y + collision.entry.start_pos.y
    );
    xValues.push(xValues[0]);
    yValues.push(yValues[0]);

    this.calculator.setExpression({
      type: "table",
      label: name,
      showLabel: true,
      columns: [
        {
          latex: "x",
          label: name,
          showLabel: true,
          values: xValues,
          points: true,
          lines: true,
          lineWidth: isPlatform ? 1.0 : 1.6,
          pointSize: isPlatform ? 3 : 4,
          color: this.makeHexFromHueIndex(idx, true),
        },
        {
          latex: "y",
          label: name,
          showLabel: true,
          values: yValues,
          points: true,
          lines: true,
          lineWidth: isPlatform ? 1.0 : 1.6,
          pointSize: isPlatform ? 3 : 4,
          color: this.makeHexFromHueIndex(idx, true),
        },
      ],
    });
  };

  async componentWillUnmount(): Promise<void> {
    window.removeEventListener("resize", this.resize);
  }

  async componentDidMount(): Promise<void> {
    const { lvdSource, debug } = this.state;
    this.setState(
      {
        loading: false,
        lvdMap: await lvdService.initLvdFromUrl(lvdSource, debug),
      },
      this.calculatorRender
    );
    window.addEventListener("resize", this.resize);
    this.resize();
  }

  calculatorRender() {
    if (this.calculator) {
      this.calculator.setBlank();
      this.draw();
      const scale = 250;
      const verticalOffset = 50;
      const ratio = !this.canvas
        ? 1.0
        : this.canvas.offsetHeight / this.canvas.offsetWidth;
      const horizontalRatio = ratio > 1 ? 1 : 1 / ratio;
      const verticalRatio = ratio < 1 ? 1 : ratio;
      this.calculator.setMathBounds({
        left: -scale * horizontalRatio,
        right: scale * horizontalRatio,
        bottom: (verticalOffset - scale) * verticalRatio,
        top: (verticalOffset + scale) * verticalRatio,
      });
    }
  }

  render() {
    if (this.state.loading) {
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <a
              className="App-link"
              href="https://reactjs.org"
              target="_blank"
              rel="noopener noreferrer"
            >
              Loading...
            </a>
          </header>
        </div>
      );
    }
    this.calculatorRender();

    return (
      <div className="App">
        <GraphingCalculator
          attributes={{
            className: "calculator",
            style: { width: "100vw", height: "100vh" },
          }}
          keypad={false}
          expressions={false}
          expressionsTopbar={false}
          expressionsCollapsed={true}
          settingsMenu={false}
          projectorMode={true}
          invertedColors={true}
          ref={(c) => {
            if (!c) return;
            this.calculator = c;
            this.canvas = elt(c);
          }}
        ></GraphingCalculator>
        <div className="sidebar-right">
          <div className="sidebar-item">
            <label>
              {"Draw Stages? "}
              <Checkbox
                checked={this.state.drawStages}
                onChange={(e) => {
                  this.setState({ drawStages: e.checked ?? true });
                }}
              />
            </label>
          </div>
          <div className="sidebar-item">
            <label>
              {"Draw Platforms? "}
              <Checkbox
                checked={this.state.drawPlatforms}
                onChange={(e) => {
                  this.setState({ drawPlatforms: e.checked ?? true });
                }}
              />
            </label>
          </div>
          <div className="sidebar-item">
            <label>
              {"Draw BlastZones? "}
              <Checkbox
                checked={this.state.drawBlastZones}
                onChange={(e) => {
                  this.setState({ drawBlastZones: e.checked ?? true });
                }}
              />
            </label>
          </div>
          <div className="sidebar-item">
            <label>
              {"Draw Camera? "}
              <Checkbox
                checked={this.state.drawCameras}
                onChange={(e) => {
                  this.setState({ drawCameras: e.checked ?? false });
                }}
              />
            </label>
          </div>
        </div>
        <div className="sidebar-left">
          <Dropdown
            className="listbox-sorter"
            value={this.state.selectedFilter}
            options={Object.values(StageFilter)}
            onChange={(e) => {
              this.setState({
                selectedFilter: e.value,
                selectedFilterFunc: stageListService.getFilterFunc(e.value),
              });
            }}
          />
          <Dropdown
            className="listbox-sorter"
            value={this.state.selectedSort}
            options={this.groupedSorters}
            optionLabel="label"
            optionGroupLabel="label"
            optionGroupChildren="items"
            onChange={(e) => this.setState({ selectedSort: e.value })}
          />
          <SelectButton
            value={this.state.selectedSortDir}
            options={Object.values(SortDir)}
            onChange={(e) => this.setState({ selectedSortDir: e.value })}
            style={{ width: "100%", display: "flex" }}
          />
          <ListBox
            multiple
            filter
            value={this.state.selectedStages}
            options={this.lvdSorter()}
            onChange={(e) => this.setState({ selectedStages: e.value })}
            itemTemplate={this.stageListTemplate}
          />
        </div>
      </div>
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

    const lvd = this.state.lvdMap.get(selectedStage);
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
    const { lvdMap, selectedSort } = this.state;
    let lvdStatsArray = Array.from(lvdMap.entries()).flatMap((entry) => {
      if (!entry[1].lvdStats || !this.state.selectedFilterFunc(entry[0])) {
        return [];
      }
      return [entry[1].lvdStats];
    });

    // sort
    let compareFn = stageListService.getSortFunc(selectedSort);
    lvdStatsArray = lvdStatsArray.sort(
      compareFn.bind(this, this.state.selectedSortDir, this.state.lvdMap)
    );

    return lvdStatsArray.map((e) => e.name); // map to string arr
  };
}
