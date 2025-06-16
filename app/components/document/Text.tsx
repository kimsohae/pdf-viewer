import { BODY_REF } from "@/constants/document";
import {
  useHighlightAction,
  useHighlightValue,
} from "@/contexts/HighlightContext";
import { useScrollToHighlighted } from "@/hooks/useScrollToHighlighted";
import {
  isDocumentElement,
  type ParsedDocument,
  type TextElement,
} from "@/types/document";
import { findElementById, getGroupBoundingBox } from "@/utils/getBoundingBox";
import { Element } from "react-scroll";

interface Props {
  element: TextElement;
  json: ParsedDocument;
  jsonRef: string;
}

export default function Text({ element, jsonRef, json }: Props) {
  const { jsonRef: highlightedRef } = useHighlightValue();

  const updateHighlight = useHighlightAction();
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
    const prov = elProv[0].bbox;
    const parentRef = element.parent.$ref;

    const highlight = {
      jsonRef,
      pdfBbox: prov,
    };

    // body가 parent가 아니면, parent 요소를 탐색한다
    if (parentRef !== BODY_REF) {
      const parentGroup = findElementById(
        [...json.groups, ...json.pictures, ...json.tables],
        parentRef
      );
      if (parentGroup && isDocumentElement(parentGroup)) {
        const groupBbox = getGroupBoundingBox(json, parentGroup);
        highlight.jsonRef = parentRef;
        highlight.pdfBbox = groupBbox || prov;
      }
    }
    updateHighlight(highlight);
  };

  return (
    <Element name={isHighlighted ? "highlightedJson" : ""}>
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
