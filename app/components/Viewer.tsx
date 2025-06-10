import type { ParsedDocument } from "@/types/document";
import { Pdf } from "@/components/Pdf";
import Document from "@/components/document/Document";
import Error from "@/components/fallback/Error";
import { ErrorBoundary } from "react-error-boundary";
import { useEffect, useState } from "react";

export default function Viewer() {
  const query = new URLSearchParams(window.location.search);
  const docName = query.get("doc") || "1.report";

  const fileSource = `/${docName}.pdf`;
  const jsonUrl = `/${docName}.json`;

  const [parsedDoc, setParsedDoc] = useState<ParsedDocument | null>(null);

  useEffect(() => {
    fetch(jsonUrl)
      .then((res) => res.json())
      .then((data) => setParsedDoc(data as ParsedDocument))
      .catch(console.error);
  }, [jsonUrl]);

  if (!parsedDoc) return <div className="text-center">Loading document...</div>;

  return (
    <ErrorBoundary fallback={<Error />}>
      <div className="grid grid-cols-2 min-h-screen max-h-screen relative w-full relative bg-gray-100">
        <div className="flex justify-center items-center">
          <Pdf parsedDoc={parsedDoc} fileSource={fileSource} />
        </div>
        <Document parsedDoc={parsedDoc} />
      </div>
    </ErrorBoundary>
  );
}
