import {
  useHighlightAction,
  useHighlightValue,
} from "@/contexts/HighlightContext";
import { useScrollToHighlighted } from "@/hooks/useScrollToHighlighted";
import type { ParsedDocument, PictureElement } from "@/types/document";
import { renderElement, resolveRef, parseRef } from "@/utils/renderElements";
import { Element } from "react-scroll";

interface Props {
  element: PictureElement;
  json: ParsedDocument;
}

export default function Picture({ element, json }: Props) {
  const { jsonRef: highlightedRef } = useHighlightValue();
  // const updateHighlight = useHighlightAction();
  const selfRef = element.self_ref;
  const isHighlighted = useScrollToHighlighted({
    highlightedRef,
    selfRef,
  });
  // const handleClick = () => {
  //   updateHighlight({ pdfBbox: element.prov[0].bbox });
  // };

  return (
    <Element name={selfRef} id={selfRef}>
      <div
        className={`flex flex-wrap gap-1 ${
          isHighlighted ? "bg-yellow-200" : ""
        }`}
        // onClick={handleClick}
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
