import { useHighlightValue } from "@/contexts/HighlightContext";
import { useScrollToHighlighted } from "@/hooks/useScrollToHighlighted";
import type { GroupElement, ParsedDocument } from "@/types/document";
import { parseRef, renderElement, resolveRef } from "@/utils/renderElements";
import { Element } from "react-scroll";

interface Props {
  element: GroupElement;
  json: ParsedDocument;
}

export default function Group({ element, json }: Props) {
  const { jsonRef: highlightedRef } = useHighlightValue();

  const selfRef = element.self_ref;
  const isHighlighted = useScrollToHighlighted({
    highlightedRef,
    selfRef,
  });

  return (
    <Element name={selfRef} id={selfRef}>
      <div className={`pl-4 my-4 ${isHighlighted ? "bg-yellow-200" : ""}`}>
        {element.children.map((child, idx) => {
          // $ref 값을 직접 전달
          return (
            <div key={idx}>
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
