import { usePosition } from "@/contexts/PositionContext";
import { renderElement, resolveRef, parseRef } from "@/utils/renderElements";

export default function Picture({ element, json }) {
  const { setPosition } = usePosition();
  const handleClick = () => {
    setPosition(element.prov[0].bbox);
  };
  return (
    <div className="flex flex-wrap gap-1" onClick={handleClick}>
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
  );
}
