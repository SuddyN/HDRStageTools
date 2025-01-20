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

interface StageSelectorProps {
  groupedSorters: {
    label: string;
    items: {
      label: string;
      value: string;
    }[];
  }[];
  lvdSorter: () => string[];
  selectedFilter: StageFilter;
  selectedFilterFunc: StageFilterFunc;
  selectedStages: string[];
  selectedSort: SortMode;
  selectedSortDir: SortDir;
  stageListTemplate: (selectedStage: string) => ReactNode;
  onChangeFilter?: (event: DropdownChangeEvent) => void;
  onChangeSort?: (event: DropdownChangeEvent) => void;
  onChangeSortDir?: (event: SelectButtonChangeEvent) => void;
  onChangeStages?: (event: ListBoxChangeEvent) => void;
}

interface StageSelectorState {}

export default class StageSelector extends React.Component<
  StageSelectorProps,
  StageSelectorState
> {
  constructor(props: StageSelectorProps) {
    super(props);
    this.state = {};
  }

  render() {
    return (
      <>
        <Dropdown
          className="listbox-sorter"
          value={this.props.selectedFilter}
          options={Object.values(StageFilter)}
          onChange={this.props.onChangeFilter}
        />
        <Dropdown
          className="listbox-sorter"
          value={this.props.selectedSort}
          options={this.props.groupedSorters}
          optionLabel="label"
          optionGroupLabel="label"
          optionGroupChildren="items"
          onChange={this.props.onChangeSort}
        />
        <SelectButton
          value={this.props.selectedSortDir}
          options={Object.values(SortDir)}
          onChange={this.props.onChangeSortDir}
          style={{ width: "100%", display: "flex" }}
        />
        <ListBox
          multiple
          filter
          value={this.props.selectedStages}
          options={this.props.lvdSorter()}
          onChange={this.props.onChangeStages}
          itemTemplate={this.props.stageListTemplate}
        />
      </>
    );
  }
}
