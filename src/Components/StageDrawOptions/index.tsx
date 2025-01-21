import React from "react";
import { Checkbox, CheckboxChangeEvent } from "primereact/checkbox";

interface StageDrawOptionsProps {
  drawStages: boolean;
  drawPlatforms: boolean;
  drawBlastZones: boolean;
  drawCameras: boolean;
  drawSpawns?: boolean;
  drawRespawns?: boolean;
  drawItemSpawners?: boolean;
  drawPTrainerPlatforms?: boolean;
  drawShrunkenBlastZones?: boolean;
  drawShrunkenCameras?: boolean;
  onChangeStages?: (event: CheckboxChangeEvent) => void;
  onChangePlatforms?: (event: CheckboxChangeEvent) => void;
  onChangeBlastzones?: (event: CheckboxChangeEvent) => void;
  onChangeCameras?: (event: CheckboxChangeEvent) => void;
}

interface StageDrawOptionsState {}

export default class StageDrawOptions extends React.Component<
  StageDrawOptionsProps,
  StageDrawOptionsState
> {
  constructor(props: StageDrawOptionsProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <>
        <div className="sidebar-item">
          <label>
            {"Draw Stages? "}
            <Checkbox
              checked={this.props.drawStages}
              onChange={this.props.onChangeStages}
            />
          </label>
        </div>
        <div className="sidebar-item">
          <label>
            {"Draw Platforms? "}
            <Checkbox
              checked={this.props.drawPlatforms}
              onChange={this.props.onChangePlatforms}
            />
          </label>
        </div>
        <div className="sidebar-item">
          <label>
            {"Draw BlastZones? "}
            <Checkbox
              checked={this.props.drawBlastZones}
              onChange={this.props.onChangeBlastzones}
            />
          </label>
        </div>
        <div className="sidebar-item">
          <label>
            {"Draw Camera? "}
            <Checkbox
              checked={this.props.drawCameras}
              onChange={this.props.onChangeCameras}
            />
          </label>
        </div>
      </>
    );
  }
}
