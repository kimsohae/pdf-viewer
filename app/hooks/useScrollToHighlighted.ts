import { useEffect } from "react";
import { scroller } from "react-scroll";


interface UseScrollToHighlightedParam {
    highlightedRef: string;
    selfRef: string;
    scrollTarget?: string;
    containerId?: string;
  }

export function useScrollToHighlighted({
    highlightedRef,
    selfRef,
    scrollTarget = "highlightedElement",
    containerId = "document",
  }:UseScrollToHighlightedParam) {
    const isHighlighted = highlightedRef === selfRef;
  
    useEffect(() => {
      if (isHighlighted) {
        scroller.scrollTo(scrollTarget, {
          containerId,
          smooth: true,
          duration: 300,
        });
      }
    }, [isHighlighted, scrollTarget, containerId]);
  
    return isHighlighted;
  }