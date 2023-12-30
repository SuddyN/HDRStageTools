import React, { ReactNode } from "react";
import { Lvd, LvdStats } from "../../Types";
import { DataTable } from "primereact/datatable";
import { Column, ColumnBodyOptions } from "primereact/column";
import { ListBox } from "primereact/listbox";

interface LvdTableProps {
  lvdMap: Map<string, Lvd>;
  selectedStages: string[];
}

interface LvdTableState {}

export default class LvdTable extends React.Component<
  LvdTableProps,
  LvdTableState
> {
  constructor(props: LvdTableProps) {
    super(props);
    this.state = {};
  }

  render() {
    const { lvdMap } = this.props;
    const lvdStatsArray = Array.from(lvdMap.entries()).flatMap((entry) => {
      if (!entry[1].lvdStats) {
        return [];
      }
      if (!this.props.selectedStages.includes(entry[0])) {
        return [];
      }
      return [entry[1].lvdStats];
    });

    return (
      <div className="lvdTable">
        <DataTable
          value={lvdStatsArray}
          size="small"
          showGridlines
          stripedRows
          removableSort
          scrollable
          tableStyle={{ width: "auto" }}
          style={{ width: "100%" }}
        >
          <Column header="Name" field="name" sortable />
          <Column
            header="Stage Width"
            field="stageWidth"
            body={(e: LvdStats) =>
              e.stageWidth ? e.stageWidth.toFixed(0) : ""
            }
            sortable
          />
          <Column
            header="Platforms"
            field="platNum"
            body={(e: LvdStats) => e.platNum.toFixed(0)}
            sortable
          />
          <Column
            header="Platform Length (Min)"
            field="platLengthMin"
            body={(e: LvdStats) =>
              Number.isFinite(e.platLengthMin) ? e.platLengthMin.toFixed(1) : ""
            }
            sortable
          />
          <Column
            header="Platform Length (Max)"
            field="platLengthMax"
            body={(e: LvdStats) =>
              Number.isFinite(e.platLengthMax) ? e.platLengthMax.toFixed(1) : ""
            }
            sortable
          />
          <Column
            header="Platform Height (Min)"
            field="platMinY"
            body={(e: LvdStats) =>
              Number.isFinite(e.platMinY) ? e.platMinY.toFixed(1) : ""
            }
            sortable
          />
          <Column
            header="Platform Height (Max)"
            field="platMaxY"
            body={(e: LvdStats) =>
              Number.isFinite(e.platMaxY) ? e.platMaxY.toFixed(1) : ""
            }
            sortable
          />
        </DataTable>
      </div>
    );
  }
}
