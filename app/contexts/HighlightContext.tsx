import type { BoundingBox } from "@/types/document";
import React, { createContext, useContext, useState } from "react";

interface Highlight {
  jsonRef: string;
  pdfBbox: BoundingBox;
}

const ValueContext = createContext<Highlight | null>(null);
const ActionContext = createContext<
  ((param: Partial<Highlight>) => void) | null
>(null);

export const initialValue: BoundingBox = {
  l: 0,
  t: 0,
  r: 0,
  b: 0,
  coord_origin: "BOTTOMLEFT",
};

export const initialHighlight = {
  jsonRef: "",
  pdfBbox: initialValue,
};

export const HighlightProvider = ({
  children,
}: {
  children: React.ReactNode;
}) => {
  const [hightlight, setHighlight] = useState<Highlight>(initialHighlight);

  const updateHighlight = (param: Partial<Highlight>) => {
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

export const useHighlightValue = () => {
  const context = useContext(ValueContext);
  if (context === null) {
    throw new Error("useHighlight should be used within BookParamProvider");
  }
  return context;
};

export const useHighlightAction = () => {
  const context = useContext(ActionContext);
  if (context === null) {
    throw new Error(
      "useHighlightAction should be used within HighlightProvider"
    );
  }
  return context;
};
