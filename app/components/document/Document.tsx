import type { ParsedDocument } from "@/types/document";
import { parseRef, renderElement, resolveRef } from "@/utils/renderElements";

interface Props extends React.HTMLAttributes<HTMLDivElement> {
  parsedDoc: ParsedDocument;
}

export default function Document({ parsedDoc }: Props) {
  return (
    <section className="h-screen flex flex-col justify-center max-h-screen">
      <h2 className="text-lg font-semibold text-gray-900 p-4 flex-0">
        preview
      </h2>
      <div
        id="document"
        className="flex-1 max-h-screen  w-full overflow-y-scroll p-6 bg-white text-gray-900 font-sans leading-relaxed"
      >
        {parsedDoc.body.children.map(({ $ref }, idx) => {
          const ref = $ref;
          return (
            <div key={idx} className="mb-6">
              {renderElement(
                ref,
                resolveRef(parseRef(ref), parsedDoc),
                parsedDoc
              )}
            </div>
          );
        })}
      </div>
    </section>
  );
}
