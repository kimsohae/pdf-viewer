import { Pdf } from "./Pdf";
import type { ParsedDocument } from "@/types/position";
import Document from "./Document";
import json from "public/1.report.json";

export default function Viewer() {
  const fileSource = "/public/1.report.pdf";
  const parsedDoc = json as unknown as ParsedDocument;
  return (
    <div className="grid grid-cols-2 min-h-screen max-h-screen relative w-full relative bg-gray-100">
      <div className="flex justify-center items-center">
        <Pdf parsedDoc={parsedDoc} fileSource={fileSource} />
      </div>
      <Document paredJson={parsedDoc} />
    </div>
  );
}
