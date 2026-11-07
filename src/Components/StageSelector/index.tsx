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
import { TAG_COLORS } from "../../Lib/StageTags/services";
import { SizeTag, TagCategory, TagSelection } from "../../Lib/StageTags/types";

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
  selectedTags: TagSelection;
  onChangeTags: (category: TagCategory, tags: SizeTag[]) => void;
  onClearTags: () => void;
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

  tagTemplate = (tag: SizeTag): ReactNode => {
    return (
      <span className="tag-filter-option">
        <span
          className="tag-filter-dot"
          style={{ backgroundColor: TAG_COLORS[tag] }}
        />
        {tag[0]}
      </span>
    );
  };

  tagFilterPanel = (): ReactNode => {
    const { selectedTags } = this.props;
    const anySelected = Object.values(TagCategory).some(
      (category) => selectedTags[category].length > 0,
    );
    return (
      <div className="tag-filter-panel">
        {Object.values(TagCategory).map((category) => (
          <div className="tag-filter-row" key={category}>
            <span className="tag-filter-label">{category}</span>
            <SelectButton
              multiple
              className="tag-filter-buttons"
              value={selectedTags[category]}
              options={Object.values(SizeTag)}
              itemTemplate={this.tagTemplate}
              onChange={(e) => this.props.onChangeTags(category, e.value ?? [])}
            />
          </div>
        ))}
        {anySelected && (
          <button
            type="button"
            className="tag-filter-clear"
            onClick={this.props.onClearTags}
          >
            Clear tags
          </button>
        )}
      </div>
    );
  };

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
          filterTemplate={(options) => (
            <div className="tag-filter-header">
              {options.element as unknown as ReactNode}
              {this.tagFilterPanel()}
            </div>
          )}
        />
      </>
    );
  }
}
