import type { BoundingBox } from "@/types/position";
import React, { createContext, useContext, useState } from "react";
import { animateScroll, scroller } from "react-scroll";

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
  const container = document.getElementById("pdf");
  const containerHeight = container?.scrollHeight ?? 0;

  const updateHighlight = (param: Partial<Hightlight>) => {
    setHighlight((prev) => {
      // const scrollTarget = containerHeight - hightlight.pdfBbox.t;
      // animateScroll.scrollTo(scrollTarget, {
      //   containerId: "pdf",
      //   smooth: true,
      //   duration: 300,
      //   delay: 100,
      // });

      return { ...prev, ...param };
    });

    // scroller.scrollTo("highlightedElement", {
    //   containerId: "documnet",
    //   smooth: true,
    //   duration: 300,
    // });

    // scroller.scrollTo("highlightedPdf", {
    //   containerId: "pdf",
    //   smooth: true,
    //   duration: 300,
    // });
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
      "useHighlightAction should be used within BookParamProvider"
    );
  }
  return context;
};
