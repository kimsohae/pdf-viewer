import ParsedDocument from "./ParsedDocument";
import parsedJson from "public/1.report.json";
import { Pdf } from "./Pdf";

export default function Viewer() {
  return (
    <div className="grid grid-cols-2 min-h-screen max-h-screen relative w-full relative bg-gray-100">
      <div className="flex justify-center items-center">
        <Pdf parsedJson={parsedJson} />
      </div>
      <ParsedDocument paredJson={parsedJson} />
    </div>
  );
}
