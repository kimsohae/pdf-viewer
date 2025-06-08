"use client";
import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "core-js/full/promise/with-resolvers.js";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import {
  useHightlightAction,
  useHightlightValue,
} from "@/contexts/HighlightContext";
import {
  findParentGroup,
  getGroupBoundingBox,
} from "@/utils/getGroupBoundingBox";
import { animateScroll, Element } from "react-scroll";
import { throttle } from "@/utils/throttle";
import type { ParsedDocument } from "@/types/position";

// import "@/styles/viewer.css";

/**
 * @document
 * https://github.com/wojtekmaj/react-pdf
 */

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  parsedJson: ParsedDocument;
  fileSource: string;
}

const scale = 1;
const padding = 8; // 반투명 오버레이 padding

export function Pdf({ parsedJson, fileSource }: Props) {
  const updateHighlight = useHightlightAction();
  const { pdfBbox: bbox } = useHightlightValue();
  const overlayStyle = {
    left: `${bbox.l * scale - padding}px`,
    bottom: `${bbox.b * scale - padding}px`,
    width: `${bbox.r - bbox.l + padding * 2}px`,
    height: `${bbox.t - bbox.b + padding * 2}px`,
  };
  const container = document.getElementById("pdf");
  const containerHeight = container?.scrollHeight ?? 0;
  const containerViewportHeight = container?.clientHeight ?? 0;
  const scrollTarget = containerHeight - bbox.t - containerViewportHeight / 2;

  const [isMouseIn, setIsMouseIn] = useState<boolean>(false);
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [pageViewport, setPageViewport] = useState<any>(null);

  // PDF 페이지의 뷰포트 정보 저장 (좌표 변환용)
  const handlePageLoadSuccess = useCallback(
    async (page: any) => {
      try {
        // PDF.js를 사용해 페이지 정보 가져오기
        const pdf = await pdfjs.getDocument("/public/1.report.pdf").promise;
        const pdfPage = await pdf.getPage(1);
        const viewport = pdfPage.getViewport({ scale });
        setPageViewport(viewport);
      } catch (error) {
        console.error("페이지 정보 로드 오류:", error);
      }
    },
    [scale]
  );

  // 마우스 위치를 PDF 좌표계로 변환하는 함수
  const convertMouseToPdfCoordinates = useCallback(
    (mouseX: number, mouseY: number) => {
      if (!containerRef) return null;

      const pageRect = containerRef.getBoundingClientRect();

      // 1. 마우스 위치를 컨테이너 상대 좌표로 변환
      const relativeX = mouseX - pageRect.left;
      const relativeY = mouseY - pageRect.top;

      // 2. 스케일 적용하여 실제 PDF 좌표로 변환
      const pdfX = relativeX / scale;

      // 3. Y 좌표는 PDF가 bottom-up 좌표계이므로 변환 필요
      // PDF의 높이에서 상대 Y 좌표를 빼서 bottom-up으로 변환
      const pdfY = pageViewport.height - relativeY / scale;

      return { x: pdfX, y: pdfY };
    },
    [containerRef, pageViewport, scale]
  );

  // PDF 좌표로 해당하는 JSON 요소 찾기
  const findElementByCoordinates = useCallback((pdfX: number, pdfY: number) => {
    // if (!parsedJson.elements) return null;
    const { texts, pictures, tables } = parsedJson;

    // parsedJson의 각 요소의 bbox와 비교
    for (const element of [...texts, ...pictures, ...tables]) {
      const { bbox } = element.prov[0];
      // bbox 구조: { l: left, r: right, t: top, b: bottom }
      // PDF 좌표계에서 (pdfX, pdfY)가 bbox 내부에 있는지 확인
      if (
        pdfX >= bbox.l && // 왼쪽 경계보다 오른쪽
        pdfX <= bbox.r && // 오른쪽 경계보다 왼쪽
        pdfY >= bbox.b && // 아래쪽 경계보다 위쪽
        pdfY <= bbox.t // 위쪽 경계보다 아래쪽
      ) {
        console.log(`요소 발견: ${element.self_ref}`);
        let prov = element.prov[0].bbox;
        const targetRef = element.self_ref;
        const parentGroup = findParentGroup(targetRef);
        if (parentGroup) {
          const groupBbox = getGroupBoundingBox(parentGroup);
          if (groupBbox) {
            prov = groupBbox;
          }
        }

        updateHighlight({
          jsonRef: parentGroup?.self_ref || targetRef,
          pdfBbox: prov,
        });
      }
    }

    return null;
  }, []);

  // 통합된 마우스 이벤트 핸들러
  const throttledMouseMove = useMemo(
    () =>
      throttle((e: React.MouseEvent<HTMLDivElement>) => {
        const mouseX = e.clientX;
        const mouseY = e.clientY;

        const pdfCoords = convertMouseToPdfCoordinates(mouseX, mouseY);

        if (pdfCoords) {
          findElementByCoordinates(pdfCoords.x, pdfCoords.y);
        }
      }, 100), // 100ms throttle
    [convertMouseToPdfCoordinates, findElementByCoordinates]
  );

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => throttledMouseMove(e),
    [throttledMouseMove]
  );

  const onMouseEnter = useCallback(() => {
    setIsMouseIn(true);
  }, []);

  const onMouseLeave = useCallback(() => {
    setIsMouseIn(false);
  }, []);

  useEffect(() => {
    if (isMouseIn) return;
    animateScroll.scrollTo(scrollTarget, {
      containerId: "pdf",
      smooth: true,
      duration: 300,
    });
  }, [bbox]);

  return (
    <Document file={fileSource}>
      {[1].map((page, idx) => (
        <div
          key={idx}
          id="pdf"
          className={`flex flex-row justify-center max-h-screen overflow-y-scroll`}
        >
          <Page
            key={idx}
            pageNumber={page}
            scale={scale}
            loading={""}
            onMouseMove={handleMouseMove}
            onMouseEnter={onMouseEnter}
            onMouseLeave={onMouseLeave}
            onLoadSuccess={handlePageLoadSuccess}
            className={"relative"}
            inputRef={setContainerRef}
          >
            {/** 반투명 오버레이 */}
            <Element name="highlightedPdf">
              <div
                className="absolute bg-blue-200/40"
                style={{
                  ...overlayStyle,
                }}
              />
            </Element>
          </Page>
        </div>
      ))}
    </Document>
  );
}
