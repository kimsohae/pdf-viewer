import { useHightlightValue } from "@/contexts/HighlightContext";
import { useScrollToHighlighted } from "@/hooks/useScrollToHighlighted";
import { parseRef, renderElement, resolveRef } from "@/utils/renderElements";
import { Element } from "react-scroll";

export default function Group({ element, json }) {
  const { jsonRef: highlightedRef } = useHightlightValue();
  const isHighlighted = useScrollToHighlighted({
    highlightedRef,
    selfRef: element.self_ref,
  });

  const handleClick = () => {
    console.log(element);
  };

  return (
    <Element name={isHighlighted ? "highlightedElement" : ""}>
      <div
        className={`pl-4 my-4 ${isHighlighted ? "bg-yellow-200" : ""}`}
        onClick={handleClick}
      >
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
