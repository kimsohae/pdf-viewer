import { parseRef, renderElement, resolveRef } from "@/utils/renderElements";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  paredJson: unknown;
}

export default function ParsedDocument({ paredJson, ...props }: Props) {
  return (
    <div className="h-full max-h-screen w-full overflow-y-scroll p-6 bg-white text-gray-900 font-sans leading-relaxed">
      {paredJson.body.children.map(({ $ref }, idx) => {
        const ref = $ref;
        return (
          <div key={idx} className="mb-6">
            {renderElement(
              ref,
              resolveRef(parseRef(ref), paredJson),
              paredJson
            )}
          </div>
        );
      })}
    </div>
  );
}
