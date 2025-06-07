import { parseRef, renderElement, resolveRef } from "@/utils/renderElements";

export default function Group({ element, json }) {
  return (
    <div className=" pl-4 my-4">
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
  );
}
