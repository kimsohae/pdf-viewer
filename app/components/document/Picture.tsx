import {
  useHightlightAction,
  useHightlightValue,
} from "@/contexts/HighlightContext";
import { useScrollToHighlighted } from "@/hooks/useScrollToHighlighted";
import { renderElement, resolveRef, parseRef } from "@/utils/renderElements";
import { Element } from "react-scroll";

export default function Picture({ element, json }) {
  const { jsonRef: highlightedRef } = useHightlightValue();
  const updateHighlight = useHightlightAction();
  const isHighlighted = useScrollToHighlighted({
    highlightedRef,
    selfRef: element.self_ref,
  });
  const handleClick = () => {
    updateHighlight({ pdfBbox: element.prov[0].bbox });
  };

  return (
    <Element name={isHighlighted ? "highlightedElement" : ""}>
      <div
        className={`flex flex-wrap gap-1 ${
          highlightedRef === element.self_ref ? "bg-yellow-200" : ""
        }`}
        onClick={handleClick}
      >
        {element.children.map((child, idx) => {
          // $ref 값을 직접 전달
          return (
            <div className="block" key={idx}>
              {renderElement(
                child.$ref,
                resolveRef(parseRef(child.$ref), json),
                json
              )}
            </div>
          );
        })}
      </div>
    </Element>
  );
}
