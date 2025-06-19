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
  const selfRef = element.self_ref;
  const isHighlighted = useScrollToHighlighted({
    highlightedRef,
    selfRef,
  });

  const { text, orig, prov: elProv } = element;
  if (!elProv) return;
  const baseText = text || orig;
  if (!baseText) return;

  const handleClick = (e: React.MouseEvent) => {
    const prov = elProv[0].bbox;
    const parentRef = element.parent.$ref;

    const highlight = {
      jsonRef,
      pdfBbox: prov,
    };

    // parent가 body가 아닌 경우: group/picture인 경우 parent를 찾는다
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
    e.stopPropagation();
  };

  return (
    <Element name={selfRef} id={selfRef}>
      <div className={`mb-2 ${isHighlighted && "bg-yellow-200"}`}>
        <span
          className="text-base text-gray-800 cursor-pointer"
          onClick={handleClick}
        >
          {baseText}
        </span>
      </div>
    </Element>
  );
}
