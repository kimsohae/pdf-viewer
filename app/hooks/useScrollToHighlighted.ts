import { useEffect } from "react";
import { scroller } from "react-scroll";


interface UseScrollToHighlightedParam {
    highlightedRef: string;
    selfRef: string;
    // scrollTarget?: string;
    containerId?: string;
  }

export function useScrollToHighlighted({
    highlightedRef,
    selfRef,
    containerId = "document",
  }:UseScrollToHighlightedParam) {
    const isHighlighted = highlightedRef === selfRef;
    

    useEffect(() => {
      if (isHighlighted) {
        const container = document.getElementById(containerId);
        const element = document.getElementById(selfRef);
     
        if (!element || !container) return;
        // 중앙 스크롤을 위한 offset 계산
        const elementHeight = element.offsetHeight;
        const offset = -container.offsetHeight / 2 + elementHeight / 2;

        scroller.scrollTo(selfRef, {
          containerId,
          offset,
          smooth: true,
          duration: 300,
        });
      }
    }, [isHighlighted, selfRef, containerId]);
  
    return isHighlighted;
  }