// hooks/useViewport.ts
import { useState, useCallback } from "react";
import { pdfjs } from "react-pdf";

export function useViewport(fileSource: string, scale:number) {
  const [pageViewport, setPageViewport] = useState<any>(null);

  const onFirstPageLoadSuccess = useCallback(async () => {
    try {
      const pdf = await pdfjs.getDocument(fileSource).promise;
      const firstPage = await pdf.getPage(1);
      const viewport = firstPage.getViewport({ scale });
      setPageViewport(viewport);
    } catch (error) {
      console.error("PDF 첫 페이지 로딩 실패:", error);
    }
  }, [fileSource]);

  return {
    pageViewport,
    onFirstPageLoadSuccess,
  };
}
