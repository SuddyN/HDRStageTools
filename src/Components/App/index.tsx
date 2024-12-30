import React, { ReactNode } from "react";
import logo from "../../logo.svg";
import "./App.css";
import { lvdService } from "../../Services/LvdService";
import { Boundary, Collision, Lvd, LvdStats } from "../../Types";
import { Checkbox } from "primereact/checkbox";
import { ListBox } from "primereact/listbox";
import { Dropdown } from "primereact/dropdown";
import { SelectButton } from "primereact/selectbutton";
import KnockbackCalculator from "../KnockbackCalculator";
import { stageListService } from "../../Services/StageListService";
import "https://www.desmos.com/api/v1.9/calculator.js?apiKey=dcb31709b452b1cf9dc26972add0fda6";

interface DesmosOptions {
  keypad?: boolean;
  graphpaper?: boolean;
  expressions?: boolean;
  settingsMenu?: boolean;
  zoomButtons?: boolean;
  showResetButtonOnGraphpaper?: boolean;
  expressionsTopbar?: boolean;
  pointsOfInterest?: boolean;
  trace?: boolean;
  border?: boolean;
  lockViewport?: boolean;
  expressionsCollapsed?: boolean;
  capExpressionSize?: boolean;
  images?: boolean;
  folders?: boolean;
  notes?: boolean;
  sliders?: boolean;
  actions?: boolean;
  substitutions?: boolean;
  links?: boolean;
  qwertyKeyboard?: boolean;
  distributions?: boolean;
  restrictedFunctions?: boolean;
  forceEnableGeometryFunctions?: boolean;
  pasteGraphLink?: boolean;
  pasteTableData?: boolean;
  clearIntoDegreeMode?: boolean;
  autosize?: boolean;
  plotInequalities?: boolean;
  plotImplicits?: boolean;
  plotSingleVariableImplicitEquations?: boolean;
  projectorMode?: boolean;
  decimalToFraction?: boolean;
  fontSize?: number;
  invertedColors?: boolean;
  sixKeyInput?: boolean;
  brailleControls?: boolean;
  audio?: boolean;
  graphDescription?: string;
  zoomFit?: boolean;
  forceLogModeRegressions?: boolean;
  defaultLogModeRegressions?: boolean;
  logScales?: boolean;
  tone?: boolean;
  intervalComprehensions?: boolean;
  muted?: boolean;
  increaseLabelPrecision?: boolean;

  degreeMode?: boolean;
  showGrid?: boolean;
  polarMode?: boolean;
  showXAxis?: boolean;
  showYAxis?: boolean;
  xAxisNumbers?: boolean;
  yAxisNumbers?: boolean;
  polarNumbers?: boolean;
  xAxisStep?: number;
  yAxisStep?: number;
  xAxisMinorSubdivisions?: number;
  yAxisMinorSubdivisions?: number;
  xAxisLabel?: string;
  yAxisLabel?: string;
  xAxisScale?: string;
  yAxisScale?: string;
}

interface AppProps {}

interface AppState {
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
  selectedFilter: string;
  selectedFilterFunc: (name: string) => boolean;
  selectedStages: string[];
  selectedSort: string;
  selectedSortDir: string;
  loading: boolean;
  lvdMap: Map<string, Lvd>;
  lvdSource: string;
}

export default class App extends React.Component<AppProps, AppState> {
  canvas: HTMLDivElement | null = null;
  calculator: any = null;
  zoom: number = 4;

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
      selectedFilter: "Legal Stages",
      selectedFilterFunc: stageListService.legalFilterFunc,
      selectedStages: ["Battlefield"],
      selectedSort: "Name",
      selectedSortDir: "Ascending",
      loading: true,
      lvdMap: new Map<string, Lvd>(),
      lvdSource: "https://suddyn.github.io/HDRStageTools/lvd/hdr-beta/lvd.zip",
    };
  }

  async componentDidMount(): Promise<void> {
    const { lvdSource, debug } = this.state;
    this.setState({
      loading: false,
      lvdMap: await lvdService.initLvdFromUrl(lvdSource, debug),
    });
    window.addEventListener("resize", this.resize);
    this.resize();
  }

  async componentWillUnmount(): Promise<void> {
    window.removeEventListener("resize", this.resize);
  }

  componentDidUpdate(
    prevProps: Readonly<AppProps>,
    prevState: Readonly<AppState>,
    snapshot?: any
  ): void {
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
    } else if (this.canvas) {
      const options: DesmosOptions = {
        keypad: false,
        expressions: false,
        expressionsTopbar: false,
        expressionsCollapsed: true,
        invertedColors: true,
        xAxisStep: 10,
        yAxisStep: 10,
        xAxisScale: "linear",
        yAxisScale: "linear",
      };

      // @ts-expect-error
      this.calculator = Desmos.GraphingCalculator(this.canvas, options);
    }
    // this.draw();
  }

  render() {
    const { lvdSource } = this.state;

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

    return (
      <div className="App">
        {/* <canvas
          ref={(element) => (this.canvas = element)}
          width={window.innerWidth * devicePixelRatio * 2}
          height={window.innerHeight * devicePixelRatio * 2}
          color="blue"
          style={{ width: window.innerWidth, height: window.innerHeight }}
        /> */}
        <div
          className="calculator"
          style={{ width: "100vw", height: "100vh" }}
          ref={(element) => (this.canvas = element)}
        />
        <div className="sidebar-right">
          <div className="sidebar-item">
            <label> Draw Stages? </label>
            <Checkbox
              checked={this.state.drawStages}
              onChange={(e) => {
                this.setState({ drawStages: e.checked ?? true });
              }}
            />
          </div>
          <div className="sidebar-item">
            <label> Draw Platforms? </label>
            <Checkbox
              checked={this.state.drawPlatforms}
              onChange={(e) => {
                this.setState({ drawPlatforms: e.checked ?? true });
              }}
            />
          </div>
          <div className="sidebar-item">
            <label> Draw BlastZones? </label>
            <Checkbox
              checked={this.state.drawBlastZones}
              onChange={(e) => {
                this.setState({ drawBlastZones: e.checked ?? true });
              }}
            />
          </div>
          <div className="sidebar-item">
            <label> Draw Camera? </label>
            <Checkbox
              checked={this.state.drawCameras}
              onChange={(e) => {
                this.setState({ drawCameras: e.checked ?? false });
              }}
            />
          </div>
          <div className="sidebar-item">
            <label> Debug Mode? </label>
            <Checkbox
              checked={false}
              onChange={(e) => {
                return; // TODO: support this!s
                this.setState({ loading: true }, async () => {
                  this.setState({
                    debug: e.checked ?? false,
                    loading: false,
                    lvdMap: await lvdService.initLvdFromUrl(
                      lvdSource,
                      e.checked
                    ),
                  });
                });
              }}
            />
          </div>
        </div>
        <div className="sidebar-left">
          <Dropdown
            className="listbox-sorter"
            value={this.state.selectedFilter}
            options={[
              "All Stages",
              "Legal Stages",
              "Supported Stages",
              "Gigaton Hammer 2",
            ]}
            onChange={(e) => {
              let filterFunc = this.state.selectedFilterFunc;
              switch (e.value) {
                case "All Stages":
                  filterFunc = (name: string) => {
                    return true;
                  };
                  break;
                case "Legal Stages":
                  filterFunc = stageListService.legalFilterFunc;
                  break;
                case "Supported Stages":
                  filterFunc = stageListService.supportedFilterFunc;
                  break;
                case "Gigaton Hammer 2":
                  filterFunc = stageListService.gigaton2FilterFunc;
                  break;
                default:
                  break;
              }
              this.setState({
                selectedFilter: e.value,
                selectedFilterFunc: filterFunc,
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
            options={["Ascending", "Descending"]}
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

  groupedSorters = [
    {
      label: "General",
      items: [
        { label: "Name", value: "Name" },
        { label: "Stage Width", value: "Stage Width" },
        // { label: "Stage+Plat Width", value: "Stage+Plat Width" },
      ],
    },
    {
      label: "Platforms",
      items: [
        //     { label: "Platform Length (min)", value: "Platform Length (min)" },
        //     { label: "Platform Length (max)", value: "Platform Length (max)" },
        //     { label: "Platform Height (min)", value: "Platform Height (min)" },
        //     { label: "Platform Height (max)", value: "Platform Height (max)" },
        { label: "Platform Count", value: "Platform Count" },
        { label: "Platform Height", value: "Platform Height" },
        { label: "Platform Height Span", value: "Platform Height Span" },
        { label: "Platform Width Span", value: "Platform Width Span" },
      ],
    },
    {
      label: "Blastzones",
      items: [
        { label: "Blastzone Left", value: "Blastzone Left" },
        { label: "Blastzone Right", value: "Blastzone Right" },
        { label: "Blastzone Top", value: "Blastzone Top" },
        { label: "Blastzone Bottom", value: "Blastzone Bottom" },
        { label: "Blastzone Width", value: "Blastzone Width" },
        { label: "Blastzone Height", value: "Blastzone Height" },
        {
          label: "Stage to Blastzone Left",
          value: "Stage to Blastzone Left",
        },
        {
          label: "Stage to Blastzone Right",
          value: "Stage to Blastzone Right",
        },
        {
          label: "Platform to Blastzone Top (min)",
          value: "Platform to Blastzone Top (min)",
        },
        {
          label: "Platform to Blastzone Top (max)",
          value: "Platform to Blastzone Top (max)",
        },
      ],
    },
  ];

  stageListTemplate = (selectedStage: string): ReactNode => {
    const idx = this.state.selectedStages.findIndex(
      (other) => selectedStage == other
    );
    const length = this.state.selectedStages.length;
    const hue = (idx * 360) / length;
    const hslaStr = idx >= 0 ? this.makeHslaFromHue(hue) : "#FFFFFF";

    const stageName = selectedStage;
    const lvd = this.state.lvdMap.get(selectedStage);
    if (!lvd?.lvdStats) {
      return stageName;
    }
    const { lvdStats: stats } = lvd;
    let stageSubtitle = "";
    switch (this.state.selectedSort) {
      case "Platform Count":
        stageSubtitle += stats.platNum.toFixed(0);
        break;
      case "Stage Width":
        stageSubtitle += stats.stageWidth.toFixed(1);
        break;
      case "Blastzone Left":
        stageSubtitle += (lvd.blast_zone[0]?.left * -1).toFixed(0);
        break;
      case "Blastzone Right":
        stageSubtitle += lvd.blast_zone[0]?.right.toFixed(0);
        break;
      case "Blastzone Top":
        stageSubtitle += lvd.blast_zone[0]?.top.toFixed(0);
        break;
      case "Blastzone Bottom":
        stageSubtitle += (lvd.blast_zone[0]?.bottom * -1).toFixed(0);
        break;
      case "Blastzone Width":
        stageSubtitle += (
          lvd.blast_zone[0]?.right - lvd.blast_zone[0]?.left
        ).toFixed(0);
        break;
      case "Blastzone Height":
        stageSubtitle += (
          lvd.blast_zone[0]?.top - lvd.blast_zone[0]?.bottom
        ).toFixed(0);
        break;
      case "Stage to Blastzone Left":
        stageSubtitle += (
          lvd.lvdStats.stageMinX - lvd.blast_zone[0].left
        ).toFixed(1);
        break;
      case "Stage to Blastzone Right":
        stageSubtitle += (
          lvd.blast_zone[0].right - lvd.lvdStats.stageMaxX
        ).toFixed(1);
        break;
      case "Platform to Blastzone Top (min)":
        stageSubtitle += (
          lvd.blast_zone[0].top - lvd.lvdStats.platMaxY
        ).toFixed(1);
        break;
      case "Platform to Blastzone Top (max)":
        stageSubtitle += (
          lvd.blast_zone[0].top - lvd.lvdStats.platMinY
        ).toFixed(1);
        break;
      case "Platform Height":
        let min = lvd.lvdStats.platMinY;
        let max = lvd.lvdStats.platMaxY;
        if (min.toFixed(1) == max.toFixed(1)) {
          stageSubtitle += min.toFixed(1);
        } else if (this.state.selectedSortDir == "Descending") {
          stageSubtitle += `${max.toFixed(1)} (${min.toFixed(1)})`;
        } else {
          stageSubtitle += `${min.toFixed(1)} (${max.toFixed(1)})`;
        }
        break;
      case "Platform Height Span":
        stageSubtitle += (
          lvd.lvdStats.platMaxY - lvd.lvdStats.platMinY
        ).toFixed(1);
        break;
      case "Platform Width Span":
        stageSubtitle += (
          lvd.lvdStats.platMaxX - lvd.lvdStats.platMinX
        ).toFixed(1);
        break;
      default:
        break;
    }
    stageSubtitle = stageSubtitle
      .replace("-Infinity", "N/A")
      .replace("Infinity", "N/A");

    return (
      <>
        <div style={{ color: hslaStr }}>{stageName}</div>
        <div style={{ fontSize: "75%" }}>{stageSubtitle}</div>
      </>
    );
  };

  // define sort functions
  nameCompareFn = (a: LvdStats, b: LvdStats): number => {
    const { selectedSortDir } = this.state;
    const mul = selectedSortDir == "Ascending" ? 1 : -1;
    if (a.name < b.name) return -1 * mul;
    else if (a.name > b.name) return 1 * mul;
    return 0;
  };

  platNumCompareFn = (a: LvdStats, b: LvdStats): number => {
    const { selectedSortDir } = this.state;
    const mul = selectedSortDir == "Ascending" ? 1 : -1;
    return (a.platNum - b.platNum) * mul;
  };

  stageWidthCompareFn = (a: LvdStats, b: LvdStats): number => {
    const { selectedSortDir } = this.state;
    const mul = selectedSortDir == "Ascending" ? 1 : -1;
    return (a.stageWidth - b.stageWidth) * mul;
  };

  blastzoneLeftCompareFn = (a: LvdStats, b: LvdStats): number => {
    const { lvdMap, selectedSortDir } = this.state;
    const mul = selectedSortDir == "Ascending" ? 1 : -1;
    const aBlstZone = lvdMap.get(a.name)?.blast_zone[0];
    const bBlstZone = lvdMap.get(b.name)?.blast_zone[0];
    if (!aBlstZone) {
      return -1 * mul;
    }
    if (!bBlstZone) {
      return 1 * mul;
    }
    return (bBlstZone.left - aBlstZone.left) * mul;
  };

  blastzoneRightCompareFn = (a: LvdStats, b: LvdStats): number => {
    const { lvdMap, selectedSortDir } = this.state;
    const mul = selectedSortDir == "Ascending" ? 1 : -1;
    const aBlstZone = lvdMap.get(a.name)?.blast_zone[0];
    const bBlstZone = lvdMap.get(b.name)?.blast_zone[0];
    if (!aBlstZone) {
      return -1 * mul;
    }
    if (!bBlstZone) {
      return 1 * mul;
    }
    return (aBlstZone.right - bBlstZone.right) * mul;
  };

  blastzoneTopCompareFn = (a: LvdStats, b: LvdStats): number => {
    const { lvdMap, selectedSortDir } = this.state;
    const mul = selectedSortDir == "Ascending" ? 1 : -1;
    const aBlstZone = lvdMap.get(a.name)?.blast_zone[0];
    const bBlstZone = lvdMap.get(b.name)?.blast_zone[0];
    if (!aBlstZone) {
      return -1 * mul;
    }
    if (!bBlstZone) {
      return 1 * mul;
    }
    return (aBlstZone.top - bBlstZone.top) * mul;
  };

  blastzoneBottomCompareFn = (a: LvdStats, b: LvdStats): number => {
    const { lvdMap, selectedSortDir } = this.state;
    const mul = selectedSortDir == "Ascending" ? 1 : -1;
    const aBlstZone = lvdMap.get(a.name)?.blast_zone[0];
    const bBlstZone = lvdMap.get(b.name)?.blast_zone[0];
    if (!aBlstZone) {
      return -1 * mul;
    }
    if (!bBlstZone) {
      return 1 * mul;
    }
    return (bBlstZone.bottom - aBlstZone.bottom) * mul;
  };

  blastzoneWidthCompareFn = (a: LvdStats, b: LvdStats): number => {
    const { lvdMap, selectedSortDir } = this.state;
    const mul = selectedSortDir == "Ascending" ? 1 : -1;
    const aBlstZone = lvdMap.get(a.name)?.blast_zone[0];
    const bBlstZone = lvdMap.get(b.name)?.blast_zone[0];
    if (!aBlstZone) {
      return -1 * mul;
    }
    if (!bBlstZone) {
      return 1 * mul;
    }
    const aNum = aBlstZone.right - aBlstZone.left;
    const bNum = bBlstZone.right - bBlstZone.left;
    return (aNum - bNum) * mul;
  };

  blastzoneHeightCompareFn = (a: LvdStats, b: LvdStats): number => {
    const { lvdMap, selectedSortDir } = this.state;
    const mul = selectedSortDir == "Ascending" ? 1 : -1;
    const aBlstZone = lvdMap.get(a.name)?.blast_zone[0];
    const bBlstZone = lvdMap.get(b.name)?.blast_zone[0];
    if (!aBlstZone) {
      return -1 * mul;
    }
    if (!bBlstZone) {
      return 1 * mul;
    }
    const aNum = aBlstZone.top - aBlstZone.bottom;
    const bNum = bBlstZone.top - bBlstZone.bottom;
    return (aNum - bNum) * mul;
  };

  stageToBlastzoneLeftCompareFn = (a: LvdStats, b: LvdStats): number => {
    const { lvdMap, selectedSortDir } = this.state;
    const mul = selectedSortDir == "Ascending" ? 1 : -1;
    const aLvd = lvdMap.get(a.name);
    const bLvd = lvdMap.get(b.name);
    if (!aLvd?.blast_zone[0] || !aLvd.lvdStats) {
      return -1 * mul;
    }
    if (!bLvd?.blast_zone[0] || !bLvd.lvdStats) {
      return 1 * mul;
    }
    const aNum = aLvd.lvdStats.stageMinX - aLvd.blast_zone[0].left;
    const bNum = bLvd.lvdStats.stageMinX - bLvd.blast_zone[0].left;
    return (aNum - bNum) * mul;
  };

  stageToBlastzoneRightCompareFn = (a: LvdStats, b: LvdStats): number => {
    const { lvdMap, selectedSortDir } = this.state;
    const mul = selectedSortDir == "Ascending" ? 1 : -1;
    const aLvd = lvdMap.get(a.name);
    const bLvd = lvdMap.get(b.name);
    if (!aLvd?.blast_zone[0] || !aLvd.lvdStats) {
      return -1 * mul;
    }
    if (!bLvd?.blast_zone[0] || !bLvd.lvdStats) {
      return 1 * mul;
    }
    const aNum = aLvd.blast_zone[0].right - aLvd.lvdStats.stageMaxX;
    const bNum = bLvd.blast_zone[0].right - bLvd.lvdStats.stageMaxX;
    return (aNum - bNum) * mul;
  };

  platformToBlastzoneTopMinCompareFn = (a: LvdStats, b: LvdStats): number => {
    const { lvdMap, selectedSortDir } = this.state;
    const mul = selectedSortDir == "Ascending" ? 1 : -1;
    const aLvd = lvdMap.get(a.name);
    const bLvd = lvdMap.get(b.name);
    if (!aLvd?.blast_zone[0] || !aLvd.lvdStats) {
      return -1 * mul;
    }
    if (!bLvd?.blast_zone[0] || !bLvd.lvdStats) {
      return 1 * mul;
    }
    const aNum = aLvd.blast_zone[0].top - aLvd.lvdStats.platMaxY;
    const bNum = bLvd.blast_zone[0].top - bLvd.lvdStats.platMaxY;
    return (aNum - bNum) * mul;
  };

  platformToBlastzoneTopMaxCompareFn = (a: LvdStats, b: LvdStats): number => {
    const { lvdMap, selectedSortDir } = this.state;
    const mul = selectedSortDir == "Ascending" ? 1 : -1;
    const aLvd = lvdMap.get(a.name);
    const bLvd = lvdMap.get(b.name);
    if (!aLvd?.blast_zone[0] || !aLvd.lvdStats) {
      return -1 * mul;
    }
    if (!bLvd?.blast_zone[0] || !bLvd.lvdStats) {
      return 1 * mul;
    }
    const aNum = aLvd.blast_zone[0].top - aLvd.lvdStats.platMinY;
    const bNum = bLvd.blast_zone[0].top - bLvd.lvdStats.platMinY;
    return (aNum - bNum) * mul;
  };

  platformHeightCompareFn = (a: LvdStats, b: LvdStats): number => {
    const { lvdMap, selectedSortDir } = this.state;
    const mul = selectedSortDir == "Ascending" ? 1 : -1;
    const aLvd = lvdMap.get(a.name);
    const bLvd = lvdMap.get(b.name);
    if (!aLvd?.lvdStats) {
      return -1 * mul;
    }
    if (!bLvd?.lvdStats) {
      return 1 * mul;
    }
    if (selectedSortDir == "Ascending") {
      return aLvd.lvdStats.platMinY - bLvd.lvdStats.platMinY;
    } else {
      return bLvd.lvdStats.platMaxY - aLvd.lvdStats.platMaxY;
    }
  };

  platformHeightSpanCompareFn = (a: LvdStats, b: LvdStats): number => {
    const { lvdMap, selectedSortDir } = this.state;
    const mul = selectedSortDir == "Ascending" ? 1 : -1;
    const aLvd = lvdMap.get(a.name);
    const bLvd = lvdMap.get(b.name);
    if (!aLvd?.lvdStats) {
      return -1 * mul;
    }
    if (!bLvd?.lvdStats) {
      return 1 * mul;
    }
    const aNum = aLvd.lvdStats.platMaxY - aLvd.lvdStats.platMinY;
    const bNum = bLvd.lvdStats.platMaxY - bLvd.lvdStats.platMinY;
    return (aNum - bNum) * mul;
  };

  platformWidthSpanCompareFn = (a: LvdStats, b: LvdStats): number => {
    const { lvdMap, selectedSortDir } = this.state;
    const mul = selectedSortDir == "Ascending" ? 1 : -1;
    const aLvd = lvdMap.get(a.name);
    const bLvd = lvdMap.get(b.name);
    if (!aLvd?.lvdStats) {
      return -1 * mul;
    }
    if (!bLvd?.lvdStats) {
      return 1 * mul;
    }
    const aNum = aLvd.lvdStats.platMaxX - aLvd.lvdStats.platMinX;
    const bNum = bLvd.lvdStats.platMaxX - bLvd.lvdStats.platMinX;
    return (aNum - bNum) * mul;
  };

  lvdSorter = (): string[] => {
    const { lvdMap, selectedSort } = this.state;
    let lvdStatsArray = Array.from(lvdMap.entries()).flatMap((entry) => {
      if (!entry[1].lvdStats) {
        return [];
      }
      if (!this.state.selectedFilterFunc(entry[0])) {
        return [];
      }
      return [entry[1].lvdStats];
    });

    // initial sort
    let compareFn = this.nameCompareFn;
    lvdStatsArray = lvdStatsArray.sort(compareFn);

    // select the correct sort
    switch (selectedSort) {
      case "Platform Count":
        compareFn = this.platNumCompareFn;
        break;
      case "Stage Width":
        compareFn = this.stageWidthCompareFn;
        break;
      case "Blastzone Left":
        compareFn = this.blastzoneLeftCompareFn;
        break;
      case "Blastzone Right":
        compareFn = this.blastzoneRightCompareFn;
        break;
      case "Blastzone Top":
        compareFn = this.blastzoneTopCompareFn;
        break;
      case "Blastzone Bottom":
        compareFn = this.blastzoneBottomCompareFn;
        break;
      case "Blastzone Width":
        compareFn = this.blastzoneWidthCompareFn;
        break;
      case "Blastzone Height":
        compareFn = this.blastzoneHeightCompareFn;
        break;
      case "Stage to Blastzone Left":
        compareFn = this.stageToBlastzoneLeftCompareFn;
        break;
      case "Stage to Blastzone Right":
        compareFn = this.stageToBlastzoneRightCompareFn;
        break;
      case "Platform to Blastzone Top (min)":
        compareFn = this.platformToBlastzoneTopMinCompareFn;
        break;
      case "Platform to Blastzone Top (max)":
        compareFn = this.platformToBlastzoneTopMaxCompareFn;
        break;
      case "Platform Height":
        compareFn = this.platformHeightCompareFn;
        break;
      case "Platform Height Span":
        compareFn = this.platformHeightSpanCompareFn;
        break;
      case "Platform Width Span":
        compareFn = this.platformWidthSpanCompareFn;
        break;
      default:
        compareFn = this.nameCompareFn;
        break;
    }

    // real sort
    lvdStatsArray = lvdStatsArray.sort(compareFn);

    // map to string arr
    const nameArr: string[] = lvdStatsArray.map((e) => e.name);
    return nameArr;
  };

  resize = () => {
    this.forceUpdate();
  };

  draw = () => {
    if (!this.calculator) {
      return;
    }
    let hueIndex = 0;
    this.state.lvdMap.forEach((lvd, name) => {
      if (!this.state.selectedStages.includes(name)) {
        return;
      }

      this.drawStage(name, lvd, hueIndex++);
    });
  };

  drawStage = (name: string, lvd: Lvd, hueIndex: number) => {
    if (!this.calculator) {
      return;
    }

    const length = this.state.selectedStages.length;
    const hue = (hueIndex * 360) / length;
    // // draw blast_zones
    if (this.state.drawBlastZones && lvd.blast_zone[0]) {
      this.drawBoundary(name, lvd.blast_zone[0], hue);
    }
    // // draw camera_boundary
    if (this.state.drawCameras && lvd.camera_boundary[0]) {
      this.drawBoundary(name, lvd.camera_boundary[0], hue);
    }
    for (const collision of lvd.collisions) {
      if (collision.col_flags.drop_through) {
        // platform
        if (this.state.drawPlatforms) {
          this.drawCollision(name, collision, hue);
        }
      } else {
        // stage
        if (this.state.drawStages) {
          this.drawCollision(name, collision, hue);
        }
      }
    }
  };

  drawBoundary = (name: string, boundary: Boundary, hue: number) => {
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
          // @ts-expect-error
          columnMode: Desmos.ColumnModes.POINTS_AND_LINES,
          color: this.makeHexFromHue(hue),
        },
        {
          latex: "y",
          label: name,
          showLabel: true,
          values: [top, top, bottom, bottom, top],
          // @ts-expect-error
          columnMode: Desmos.ColumnModes.POINTS_AND_LINES,
          color: this.makeHexFromHue(hue),
        },
      ],
    });
  };

  drawCollision = (name: string, collision: Collision, hue: number) => {
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
          // @ts-expect-error
          columnMode: Desmos.ColumnModes.POINTS_AND_LINES,
          color: this.makeHexFromHue(hue),
        },
        {
          latex: "y",
          label: name,
          showLabel: true,
          values: yValues,
          // @ts-expect-error
          columnMode: Desmos.ColumnModes.POINTS_AND_LINES,
          color: this.makeHexFromHue(hue),
        },
      ],
    });
  };

  makeHslaFromHue = (hue: number) => {
    const s = 100;
    const l = 66;
    const a = 1;

    return `hsla(${hue}, ${s}%, ${l}%, ${a})`;
  };

  makeHexFromHue = (hue: number) => {
    const l = 66 / 100;
    const a = (100 * Math.min(l, 1 - l)) / 100;
    const f = (n: number) => {
      const k = (n + hue / 30) % 12;
      const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
      return Math.round(255 * color)
        .toString(16)
        .padStart(2, "0"); // convert to Hex and prefix "0" if needed
    };
    return `#${f(0)}${f(8)}${f(4)}`;
  };
}
