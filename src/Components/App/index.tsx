import React, { ReactNode } from "react";
import logo from "../../logo.svg";
import "./App.css";
import { lvdService } from "../../Services/LvdService";
import { Boundary, Collision, Lvd, LvdStats, Vec2 } from "../../Types";
import { Checkbox } from "primereact/checkbox";
import { ListBox } from "primereact/listbox";
import LvdTable from "../LvdTable";
import { Dropdown } from "primereact/dropdown";
import { ToggleButton } from "primereact/togglebutton";
import { SelectButton } from "primereact/selectbutton";

interface AppProps {}

interface AppState {
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
  showStats: boolean;
  selectedStages: string[];
  selectedSort: string;
  selectedSortDir: string;
  loading: boolean;
  lvdMap: Map<string, Lvd>;
}

export default class App extends React.Component<AppProps, AppState> {
  canvas: HTMLCanvasElement | null = null;
  zoom: number = 4;

  constructor(props: AppProps) {
    super(props);
    this.state = {
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
      showStats: false,
      selectedStages: ["battlefield"],
      selectedSort: "Name",
      selectedSortDir: "Ascending",
      loading: true,
      lvdMap: new Map<string, Lvd>(),
    };
  }

  async componentDidMount(): Promise<void> {
    this.setState({
      loading: false,
      lvdMap: await lvdService.initLvdFromUrl(
        "https://suddyn.github.io/HDRStageTools/lvd/hdr-nightly/lvd.zip"
      ),
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
    this.draw();
  }

  render() {
    const { lvdMap } = this.state;

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
        <canvas
          ref={(element) => (this.canvas = element)}
          width={window.innerWidth * devicePixelRatio * 2}
          height={window.innerHeight * devicePixelRatio * 2}
          color="blue"
          style={{ width: window.innerWidth, height: window.innerHeight }}
        />
        <div className="sidebar-left">
          {!this.state.showStats && (
            <>
              <div className="sidebar-item">
                <Checkbox
                  checked={this.state.drawStages}
                  onChange={(e) => {
                    this.setState({ drawStages: e.checked ?? true });
                  }}
                />
                <label> Draw Stages? </label>
              </div>
              <div className="sidebar-item">
                <Checkbox
                  checked={this.state.drawPlatforms}
                  onChange={(e) => {
                    this.setState({ drawPlatforms: e.checked ?? true });
                  }}
                />
                <label> Draw Platforms? </label>
              </div>
              <div className="sidebar-item">
                <Checkbox
                  checked={this.state.drawBlastZones}
                  onChange={(e) => {
                    this.setState({ drawBlastZones: e.checked ?? true });
                  }}
                />
                <label> Draw BlastZones? </label>
              </div>
              <div className="sidebar-item">
                <Checkbox
                  checked={this.state.drawCameras}
                  onChange={(e) => {
                    this.setState({ drawCameras: e.checked ?? false });
                  }}
                />
                <label> Draw Camera? </label>
              </div>
            </>
          )}
        </div>
        <div className="sidebar-right">
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
        { label: "Platform Count", value: "Platform Count" },
        { label: "Stage Width", value: "Stage Width" },
        // { label: "Stage+Plat Width", value: "Stage+Plat Width" },
      ],
    },
    {
      label: "Blastzones",
      items: [
        { label: "Blastzone Left", value: "Blastzone Left" },
        { label: "Blastzone Right", value: "Blastzone Right" },
        { label: "Blastzone Top", value: "Blastzone Top" },
        { label: "Blastzone Bottom", value: "Blastzone Bottom" },
        //   { label: "Blastzone Width", value: "Blastzone Width" },
        //   { label: "Blastzone Height", value: "Blastzone Height" },
        //   {
        //     label: "Stage to Blastzone Left (min)",
        //     value: "Stage to Blastzone Left (min)",
        //   },
        //   {
        //     label: "Stage to Blastzone Left (max)",
        //     value: "Stage to Blastzone Left (max)",
        //   },
        //   {
        //     label: "Stage to Blastzone Right (min)",
        //     value: "Stage to Blastzone Right (min)",
        //   },
        //   {
        //     label: "Stage to Blastzone Right (max)",
        //     value: "Stage to Blastzone Right (max)",
        //   },
        //   {
        //     label: "Platform to Blastzone Top (min)",
        //     value: "Platform to Blastzone Top (min)",
        //   },
        //   {
        //     label: "Platform to Blastzone Top (max)",
        //     value: "Platform to Blastzone Top (max)",
        //   },
      ],
    },
    // {
    //   label: "Platforms",
    //   items: [
    //     { label: "Platform Length (min)", value: "Platform Length (min)" },
    //     { label: "Platform Length (max)", value: "Platform Length (max)" },
    //     { label: "Platform Height (min)", value: "Platform Height (min)" },
    //     { label: "Platform Height (max)", value: "Platform Height (max)" },
    //     { label: "Platform Width Span", value: "Platform Width Span" },
    //     { label: "Platform Height Span", value: "Platform Height Span" },
    //   ],
    // },
  ];

  stageListTemplate = (selectedStage: string): ReactNode => {
    const stageName = selectedStage;
    const lvd = this.state.lvdMap.get(selectedStage);
    if (!lvd || !lvd.lvdStats) {
      return stageName;
    }
    const { lvdStats: stats } = lvd;
    var stageSubtitle = ": ";
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
      default:
        stageSubtitle = "";
        break;
    }

    return (
      <>
        {stageName}
        {stageSubtitle}
      </>
    );
  };

  lvdSorter = (): string[] => {
    const { lvdMap, selectedSort, selectedSortDir } = this.state;
    var lvdStatsArray = Array.from(lvdMap.entries()).flatMap((entry) => {
      if (!entry[1].lvdStats) {
        return [];
      }
      return [entry[1].lvdStats];
    });

    // define sort functions
    const nameCompareFn = (a: LvdStats, b: LvdStats): number => {
      const mul = selectedSortDir == "Ascending" ? 1 : -1;
      if (a.name < b.name) return -1 * mul;
      else if (a.name > b.name) return 1 * mul;
      return 0;
    };

    const platNumCompareFn = (a: LvdStats, b: LvdStats): number => {
      const mul = selectedSortDir == "Ascending" ? 1 : -1;
      return (a.platNum - b.platNum) * mul;
    };

    const stageWidthCompareFn = (a: LvdStats, b: LvdStats): number => {
      const mul = selectedSortDir == "Ascending" ? 1 : -1;
      return (a.stageWidth - b.stageWidth) * mul;
    };

    const blastzoneLeftCompareFn = (a: LvdStats, b: LvdStats): number => {
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

    const blastzoneRightCompareFn = (a: LvdStats, b: LvdStats): number => {
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

    const blastzoneTopCompareFn = (a: LvdStats, b: LvdStats): number => {
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

    const blastzoneBottomCompareFn = (a: LvdStats, b: LvdStats): number => {
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

    // initial sort
    var compareFn = nameCompareFn;
    lvdStatsArray = lvdStatsArray.sort(compareFn);

    // select the correct sort
    switch (selectedSort) {
      case "Platform Count":
        compareFn = platNumCompareFn;
        break;
      case "Stage Width":
        compareFn = stageWidthCompareFn;
        break;
      case "Blastzone Left":
        compareFn = blastzoneLeftCompareFn;
        break;
      case "Blastzone Right":
        compareFn = blastzoneRightCompareFn;
        break;
      case "Blastzone Top":
        compareFn = blastzoneTopCompareFn;
        break;
      case "Blastzone Bottom":
        compareFn = blastzoneBottomCompareFn;
        break;
      default:
        compareFn = nameCompareFn;
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
    if (!this.canvas) {
      console.error("could not draw because canvas is null or undefined");
      return;
    }
    const ctx = this.canvas.getContext("2d");
    if (!ctx) {
      console.error("could not draw because context is null or undefined");
      return;
    }
    ctx.setTransform(
      1.0,
      0.0,
      0.0,
      -1.0,
      this.canvas.width / 2,
      this.canvas.height / 2
    );
    ctx.lineWidth = 1;
    ctx.fillStyle = "rgb(30, 30, 30)";
    ctx.globalCompositeOperation = "lighter";
    ctx.clearRect(
      -this.canvas.width / 2,
      -this.canvas.height / 2,
      this.canvas.width,
      this.canvas.height
    );
    ctx.fillRect(
      -this.canvas.width / 2,
      -this.canvas.height / 2,
      this.canvas.width,
      this.canvas.height
    );

    var hueIndex = 0;
    this.state.lvdMap.forEach((name, lvd) => {
      if (!this.state.selectedStages.includes(lvd)) {
        return;
      }
      this.drawStage(ctx, lvd, name, hueIndex++);
    });
  };

  drawStage = (
    ctx: CanvasRenderingContext2D,
    name: string,
    lvd: Lvd,
    hueIndex: number
  ) => {
    const length = this.state.selectedStages.length;
    const hue = (hueIndex * 360) / length + (length < 3 ? 22 : 0);

    // draw blast_zones
    ctx.lineWidth = 4;
    ctx.setLineDash([16, 16]);
    if (this.state.drawBlastZones && lvd.blast_zone[0]) {
      this.drawBoundary(ctx, lvd.blast_zone[0], hue);
    }

    // draw camera_boundary
    ctx.lineWidth = 4;
    ctx.setLineDash([8, 8]);
    if (this.state.drawCameras && lvd.camera_boundary[0]) {
      this.drawBoundary(ctx, lvd.camera_boundary[0], hue);
    }

    // draw collisions
    ctx.lineWidth = 4;
    ctx.setLineDash([]);
    for (const collision of lvd.collisions) {
      if (collision.col_flags.drop_through) {
        // platform
        if (this.state.drawPlatforms) {
          this.drawCollision(ctx, collision, hue);
        }
      } else {
        // stage
        if (this.state.drawStages) {
          this.drawCollision(ctx, collision, hue);
        }
      }
    }
  };

  drawBoundary = (
    ctx: CanvasRenderingContext2D,
    boundary: Boundary,
    hue: number
  ) => {
    if (!this.canvas) {
      throw "canvas is null or undefined";
    }
    const zoom = this.zoom;
    const { left, right, bottom, top } = boundary;
    const width = right - left;
    const height = top - bottom;

    ctx.strokeStyle = this.makeHslaFromHue(hue);
    ctx.strokeRect(left * zoom, bottom * zoom, width * zoom, height * zoom);
  };

  drawCollision = (
    ctx: CanvasRenderingContext2D,
    collision: Collision,
    hue: number
  ) => {
    const zoom = this.zoom;
    const path = collision.vertices;
    ctx.beginPath();
    ctx.moveTo(
      (path[0].x + collision.entry.start_pos.x) * zoom,
      (path[0].y + collision.entry.start_pos.y) * zoom
    );
    for (var i = 1; i < path.length; i++) {
      ctx.lineTo(
        (path[i].x + collision.entry.start_pos.x) * zoom,
        (path[i].y + collision.entry.start_pos.y) * zoom
      );
    }
    ctx.strokeStyle = this.makeHslaFromHue(hue);
    ctx.stroke();
  };

  makeHslaFromHue = (hue: number) => {
    const s = 100;
    const l = 50;
    const a = 1;

    return `hsla(${hue}, ${s}%, ${l}%, ${a})`;
  };
}
