import React from "react";
import { GraphingCalculator } from "desmos-react";

export const DesmosView = React.forwardRef<Desmos.Calculator>((props, ref) => {
  return (
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
      ref={ref}
    />
  );
});
