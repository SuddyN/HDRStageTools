import React from "react";
import logo from "../../logo.svg";
import "./App.css";
import { lvdService } from "../../Services/LvdService";
import { Lvd } from "../../Types";

interface AppProps {}

interface AppState {
  lvdMap?: Map<string, Lvd>;
}

export default class App extends React.Component<AppProps, AppState> {
  constructor(props: AppProps) {
    super(props);
    this.state = {
      lvdMap: undefined,
    };
  }

  async componentDidMount(): Promise<void> {
    this.setState({
      lvdMap: await lvdService.readLvdFromUrl(
        "https://suddyn.github.io/HDRStageTools/lvd/ultimate/lvd.zip"
      ),
    });
  }

  render() {
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
            Learn React
          </a>
        </header>
      </div>
    );
  }
}
