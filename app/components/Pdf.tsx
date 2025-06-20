"use client";
import React, { useEffect, useMemo, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "core-js/full/promise/with-resolvers.js";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import { Element, animateScroll } from "react-scroll";
import {
  useHighlightAction,
  useHighlightValue,
} from "@/contexts/HighlightContext";
import { useViewport } from "@/hooks/useViewport";
import { throttle } from "@/utils/throttle";
import type { ParsedDocument } from "@/types/document";
import { useRBushSearch } from "@/hooks/useRBushSearch";
import Error from "@/components/fallback/Error";
import Loading from "@/components/fallback/Loading";

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

const scale = 1;
const padding = 8; // 하이라이트 패딩

interface Props {
  parsedDoc: ParsedDocument;
  fileSource: string;
}

export function Pdf({ parsedDoc, fileSource }: Props) {
  const updateHighlight = useHighlightAction();
  const { pdfBbox } = useHighlightValue();
  // const [isMouseIn, setIsMouseIn] = useState(false);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [numPages, setNumPages] = useState(0);
  const [loadError, setLoadError] = useState<string | null>(null);

  const { pageViewport, onFirstPageLoadSuccess } = useViewport(
    fileSource,
    scale
  );
  const { searchByPoint } = useRBushSearch(parsedDoc);

  const overlayStyle = useMemo(
    () => ({
      left: `${pdfBbox.l * scale - padding}px`,
      bottom: `${pdfBbox.b * scale - padding}px`,
      width: `${(pdfBbox.r - pdfBbox.l) * scale + padding * 2}px`,
      height: `${(pdfBbox.t - pdfBbox.b) * scale + padding * 2}px`,
    }),
    [pdfBbox, scale]
  );
  const scrollTarget =
    (containerRef?.scrollHeight ?? 0) -
    pdfBbox.t -
    (containerRef?.clientHeight ?? 0) / 2;

  const handleMouseMove = useMemo(
    () =>
      throttle((e: React.MouseEvent<HTMLDivElement>) => {
        if (!pageViewport || !containerRef) return;
        const rect = containerRef.getBoundingClientRect();
        const x = (e.clientX - rect.left) / scale;
        const y = (pageViewport.height - (e.clientY - rect.top)) / scale;

        const el = searchByPoint(x, y);

        // 기존 하이라이팅과 다른 경우에만 update
        if (el && pdfBbox.b !== el.pdfBbox.b) updateHighlight(el);
      }, 100),
    [pageViewport, containerRef, searchByPoint]
  );

  useEffect(() => {
    if (containerRef) {
      animateScroll.scrollTo(scrollTarget, {
        containerId: "pdf",
        smooth: true,
        duration: 300,
      });
    }
  }, [pdfBbox]);

  if (loadError) {
    return <Error errorMessage={loadError} />;
  }

  return (
    <div className="h-screen overflow-y-scroll" id="pdf">
      <Document
        file={fileSource}
        loading={<Loading />}
        onLoadSuccess={({ numPages }) => setNumPages(numPages)}
        onLoadError={(err) => setLoadError("PDF 로딩 실패: " + err.message)}
      >
        {Array.from({ length: numPages }, (_, i) => (
          <Page
            key={i}
            pageNumber={i + 1}
            scale={scale}
            loading={<Loading />}
            error={<Error />}
            onMouseMove={handleMouseMove}
            // onMouseEnter={() => setIsMouseIn(true)}
            // onMouseLeave={() => setIsMouseIn(false)}
            onLoadSuccess={i === 0 ? onFirstPageLoadSuccess : undefined}
            className="relative"
            inputRef={setContainerRef}
          >
            <Element name="highlightedPdf">
              <div className="absolute bg-blue-200/40" style={overlayStyle} />
            </Element>
          </Page>
        ))}
      </Document>
    </div>
  );
}
