import type { BoundingBox } from "@/types/position";
import React, { createContext, useContext, useState } from "react";

interface Hightlight {
  jsonRef: string;
  pdfBbox: BoundingBox;
}

const ValueContext = createContext<Hightlight | null>(null);
const ActionContext = createContext<
  ((param: Partial<Hightlight>) => void) | null
>(null);

export const initialValue: BoundingBox = {
  l: 0,
  t: 0,
  r: 0,
  b: 0,
  coord_origin: "BOTTOMLEFT",
};

export const initialHightlight = {
  jsonRef: "",
  pdfBbox: initialValue,
};

export const HightligthProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [hightlight, setHighlight] = useState<Hightlight>(initialHightlight);

  const updateHighlight = (param: Partial<Hightlight>) => {
    setHighlight((prev) => ({ ...prev, ...param }));
  };

  return (
    <ValueContext.Provider value={hightlight}>
      <ActionContext.Provider value={updateHighlight}>
        {children}
      </ActionContext.Provider>
    </ValueContext.Provider>
  );
};

export const useHightlightValue = () => {
  const context = useContext(ValueContext);
  if (context === null) {
    throw new Error("useHighlight should be used within BookParamProvider");
  }
  return context;
};

export const useHightlightAction = () => {
  const context = useContext(ActionContext);
  if (context === null) {
    throw new Error(
      "useHighlightAction should be used within HighlightProvider"
    );
  }
  return context;
};
