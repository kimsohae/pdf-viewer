import {
  useHightlightAction,
  useHightlightValue,
} from "@/contexts/HighlightContext";
import { useScrollToHighlighted } from "@/hooks/useScrollToHighlighted";
import {
  findParentGroup,
  getGroupBoundingBox,
} from "@/utils/getGroupBoundingBox";
import { Element } from "react-scroll";

export default function Text({ element, jsonRef }) {
  const { jsonRef: highlightedRef } = useHightlightValue();

  const updateHighlight = useHightlightAction();
  const isHighlighted = useScrollToHighlighted({
    highlightedRef,
    selfRef: element.self_ref,
  });

  const { text, orig, prov: elProv } = element;
  if (!elProv) return;
  const baseText = text || orig;
  if (!baseText) return;

  const renderedText = elProv
    .map((entry) => ({ text: baseText, start: entry.charspan[0] }))
    .map((s) => s.text)
    .join("");

  const handleClick = () => {
    const parentGroup = findParentGroup(jsonRef);
    let prov = elProv[0].bbox;

    console.log({ parentGroup });

    if (parentGroup) {
      const groupBbox = getGroupBoundingBox(parentGroup);
      if (groupBbox) {
        prov = groupBbox;
      }
    }
    updateHighlight({
      jsonRef: parentGroup?.self_ref || jsonRef,
      pdfBbox: prov,
    });
  };

  return (
    <Element name={isHighlighted ? "highlightedElement" : ""}>
      <div className={`mb-2 ${highlightedRef === jsonRef && "bg-yellow-200"}`}>
        <span
          className="text-base text-gray-800 cursor-pointer"
          onClick={handleClick}
        >
          {renderedText}
        </span>
      </div>
    </Element>
  );
}
