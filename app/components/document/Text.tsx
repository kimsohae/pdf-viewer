import { usePosition } from "@/contexts/PositionContext";
import { getGroupBoundingBox } from "@/utils/getGroupBoundingBox";

export default function Text({ element, jsonRef }) {
  const { setPosition } = usePosition();

  const { text, orig, prov: elProv } = element;
  if (!elProv) return;
  const baseText = text || orig;
  if (!baseText) return;

  const renderedText = elProv
    .map((entry) => ({ text: baseText, start: entry.charspan[0] }))
    .map((s) => s.text)
    .join("");

  const handleClick = () => {
    let prov = getGroupBoundingBox(jsonRef);
    if (!prov) {
      prov = elProv[0].bbox;
      1;
    }
    setPosition(prov);
  };

  return (
    <div className="mb-2">
      <span
        className="text-base text-gray-800 cursor-pointer"
        onClick={handleClick}
      >
        {renderedText}
      </span>
    </div>
  );
}
