import React from "react";
import logo from "../../logo.svg";
import "./App.css";
import { elt } from "desmos-react";
import { DesmosView } from "../DesmosView";
import { Lvd } from "../../Lib/Lvd/types";
import { lvdService } from "../../Lib/Lvd/services";
import StageTool from "../StageTool";
const LVD_SOURCE: string = "./lvd/hdr-beta/lvd.zip";

interface AppProps {}

interface AppState {
  loading: boolean;
  lvdMap: Map<string, Lvd>;
  lvdSource: string;
}

export default class App extends React.Component<AppProps, AppState> {
  canvas: HTMLDivElement | null = null;
  calculator: Desmos.Calculator | null = null;

  constructor(props: AppProps) {
    super(props);
    this.state = {
      loading: true,
      lvdMap: new Map<string, Lvd>(),
      lvdSource: LVD_SOURCE,
    };
  }

  resize = () => {
    this.forceUpdate();
  };

  async componentDidMount(): Promise<void> {
    const { lvdSource } = this.state;
    this.setState({
      loading: false,
      lvdMap: await lvdService.initLvdFromUrl(lvdSource, false),
    });
    window.addEventListener("resize", this.resize);
    this.resize();
  }

  async componentWillUnmount(): Promise<void> {
    window.removeEventListener("resize", this.resize);
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
    return (
      <div className="App">
        <DesmosView
          ref={(c) => {
            if (!c) return;
            this.calculator = c;
            this.canvas = elt(c);
          }}
        />
        {this.calculator && this.canvas && (
          <StageTool
            canvas={this.canvas}
            calculator={this.calculator}
            loading={this.state.loading}
            lvdMap={this.state.lvdMap}
          />
        )}
      </div>
    );
  }
}
