import React from "react";
import logo from "../../logo.svg";
import "./App.css";
import { lvdService } from "../../Services/LvdService";
import { Boundary, Collision, Lvd, Vec2 } from "../../Types";
import { Checkbox } from "primereact/checkbox";
import { ListBox } from "primereact/listbox";

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
  selectedStages: string[];
  loading: boolean;
  lvdMap?: Map<string, Lvd>;
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
      selectedStages: ["battlefield"],
      loading: true,
      lvdMap: undefined,
    };
  }

  async componentDidMount(): Promise<void> {
    this.setState({
      loading: false,
      lvdMap: await lvdService.readLvdFromUrl(
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
    if (this.state.loading) {
      return (
        <div className="App">
          <header className="App-header">
            <img src={logo} className="App-logo" alt="logo" />
            <p>
              Edit <code>src/App.tsx</code> and save to reload.
            </p>
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
        <div className="sidebar-right">
          <div className="sidebar-item">
            <label>Draw Stages? </label>
            <Checkbox
              checked={this.state.drawStages}
              onChange={(e) => {
                console.log(e);
                this.setState({ drawStages: e.checked ?? true });
              }}
            />
          </div>
          <div className="sidebar-item">
            <label>Draw Platforms? </label>
            <Checkbox
              checked={this.state.drawPlatforms}
              onChange={(e) => {
                console.log(e);
                this.setState({ drawPlatforms: e.checked ?? true });
              }}
            />
          </div>
          <div className="sidebar-item">
            <label>Draw BlastZones? </label>
            <Checkbox
              checked={this.state.drawBlastZones}
              onChange={(e) => {
                console.log(e);
                this.setState({ drawBlastZones: e.checked ?? true });
              }}
            />
          </div>
          <div className="sidebar-item">
            <label>Draw Camera? </label>
            <Checkbox
              checked={this.state.drawCameras}
              onChange={(e) => {
                console.log(e);
                this.setState({ drawCameras: e.checked ?? false });
              }}
            />
          </div>
        </div>
        <div className="sidebar-left">
          <ListBox
            multiple
            filter
            value={this.state.selectedStages}
            options={
              this.state.lvdMap ? Array.from(this.state.lvdMap.keys()) : []
            }
            onChange={(e) => this.setState({ selectedStages: e.value })}
            listStyle={{ height: "100%", paddingBottom: "2rem" }}
            style={{ maxHeight: "100%" }}
          />
        </div>
      </div>
    );
  }

  resize = () => {
    this.forceUpdate();
  };

  draw = () => {
    if (!this.state.lvdMap) {
      console.error("could not draw because lvdMap is null or undefined");
      return;
    }
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
    if (!this.state.lvdMap) {
      console.error("could not draw because lvdMap is null or undefined");
      return;
    }

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
