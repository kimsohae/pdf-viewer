"use client";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import "core-js/full/promise/with-resolvers.js";
import "react-pdf/dist/esm/Page/AnnotationLayer.css";
import "react-pdf/dist/esm/Page/TextLayer.css";
import parsedJson from "public/1.report.json";
import ParsedDocument from "./ParsedDocument";
import { usePosition } from "@/contexts/PositionContext";

// import "@/styles/viewer.css";

/**
 * @document
 * https://github.com/wojtekmaj/react-pdf
 */

console.log(pdfjs.version);

pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface Props {
  title?: string;
}

const resizeObserverOptions = {};
const fileSource = "/public/1.report.pdf";

// 한 페이지의 최대넓이: 화면 반 크기
// const maxHeight = Math.max(
//   document.documentElement.clientHeight || 0,
//   window.innerHeight || 0
// );

const scale = 1;
const padding = 16;

export function Pdf() {
  const { position: bbox } = usePosition();
  const overlayStyle = {
    left: `${bbox.l * scale}px`,
    bottom: `${bbox.b * scale}px`,
    width: `${bbox.r - bbox.l}px`,
    height: `${bbox.t - bbox.b}px`,
  };
  const [numPages, setNumPages] = useState(0);
  const [pageNumber, setPageNumber] = useState(1);
  const [clientHeight, setClientHeight] = useState(
    typeof window !== "undefined"
      ? Math.max(
          document.documentElement.clientHeight || 0,
          window.innerHeight || 0
        )
      : 0
  );
  const [clientWidth, setClientWidth] = useState(
    document?.documentElement.clientWidth || 0
  );
  const [containerRef, setContainerRef] = useState<HTMLElement | null>(null);
  const [pageViewport, setPageViewport] = useState<any>(null);
  const [hoveredElementId, setHoveredElementId] = useState<string | null>(null);

  const docContainerRef = useRef<HTMLDivElement>(null);
  // PDF 페이지의 뷰포트 정보 저장 (좌표 변환용)
  const handlePageLoadSuccess = useCallback(
    async (page: any) => {
      try {
        // PDF.js를 사용해 페이지 정보 가져오기
        const pdf = await pdfjs.getDocument("/public/1.report.pdf").promise;
        const pdfPage = await pdf.getPage(pageNumber);
        const viewport = pdfPage.getViewport({ scale });
        setPageViewport(viewport);
        console.log("viewport");
      } catch (error) {
        console.error("페이지 정보 로드 오류:", error);
      }
    },
    [pageNumber, scale]
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
    console.log(parsedJson);
    // if (!parsedJson.elements) return null;
    console.log(pdfX, pdfY);
    const { texts, pictures, tables } = parsedJson;

    console.log(texts);
    // parsedJson의 각 요소의 bbox와 비교
    for (const element of texts) {
      const { bbox } = element.prov[0];
      // bbox 구조: { l: left, r: right, t: top, b: bottom }
      // PDF 좌표계에서 (pdfX, pdfY)가 bbox 내부에 있는지 확인
      if (
        pdfX >= bbox.l && // 왼쪽 경계보다 오른쪽
        pdfX <= bbox.r && // 오른쪽 경계보다 왼쪽
        pdfY >= bbox.b && // 아래쪽 경계보다 위쪽
        pdfY <= bbox.t // 위쪽 경계보다 아래쪽
      ) {
        console.log(`요소 발견: ${element.id}`, {
          mouseCoord: { x: pdfX, y: pdfY },
          elementBbox: bbox,
          elementContent: element.content?.substring(0, 50),
        });
        return element.id;
      }
    }

    return null;
  }, []);

  // 통합된 마우스 이벤트 핸들러
  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      // 브라우저 마우스 좌표 가져오기
      const mouseX = e.clientX;
      const mouseY = e.clientY;

      // PDF 좌표로 변환
      const pdfCoords = convertMouseToPdfCoordinates(mouseX, mouseY);

      if (pdfCoords) {
        // 해당 좌표의 요소 찾기
        const elementId = findElementByCoordinates(pdfCoords.x, pdfCoords.y);

        // 디버깅을 위한 로그
        if (elementId !== hoveredElementId) {
          console.log("호버 변경:", {
            from: hoveredElementId,
            to: elementId,
            coordinates: pdfCoords,
            mousePosition: { x: mouseX, y: mouseY },
          });
        }

        setHoveredElementId(elementId);
      }
    },
    [convertMouseToPdfCoordinates, findElementByCoordinates, hoveredElementId]
  );

  // 마우스가 PDF 영역을 벗어날 때
  const handleMouseLeave = useCallback(() => {
    setHoveredElementId(null);
  }, []);

  // 좌표 변환 정확도를 높이기 위한 추가 함수들
  const getElementBoundsInScreenCoords = useCallback(
    (elementId: string) => {
      if (!containerRef || !pageViewport) return null;

      const element = parsedJson.elements?.find((el) => el.id === elementId);
      if (!element) return null;

      const pageRect = containerRef.getBoundingClientRect();
      const { bbox } = element;

      // PDF 좌표를 화면 좌표로 변환
      const screenLeft = pageRect.left + bbox.l * scale;
      const screenRight = pageRect.left + bbox.r * scale;
      const screenTop = pageRect.top + (pageViewport.height - bbox.t) * scale;
      const screenBottom =
        pageRect.top + (pageViewport.height - bbox.b) * scale;

      return {
        left: screenLeft,
        right: screenRight,
        top: screenTop,
        bottom: screenBottom,
        width: bbox.r - bbox.l,
        height: bbox.t - bbox.b,
      };
    },
    [containerRef, pageViewport, scale]
  );

  // 정밀도 향상을 위한 여러 단계 매칭
  const findElementWithPrecision = useCallback(
    (mouseX: number, mouseY: number) => {
      const pdfCoords = convertMouseToPdfCoordinates(mouseX, mouseY);

      console.log(mouseX, mouseY);
      if (!pdfCoords) return null;

      let bestMatch = null;
      let smallestArea = Infinity;

      // 모든 요소 중에서 마우스 포인터를 포함하는 가장 작은 요소 찾기
      for (const element of parsedJson.elements || []) {
        const { bbox } = element;

        if (
          pdfCoords.x >= bbox.l &&
          pdfCoords.x <= bbox.r &&
          pdfCoords.y >= bbox.b &&
          pdfCoords.y <= bbox.t
        ) {
          const area = (bbox.r - bbox.l) * (bbox.t - bbox.b);
          if (area < smallestArea) {
            smallestArea = area;
            bestMatch = element.id;
          }
        }
      }

      return bestMatch;
    },
    [convertMouseToPdfCoordinates]
  );

  // 개선된 마우스 이벤트 핸들러
  const handlePreciseMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      console.log(e.pageX, e.pageY, e.clientX, e.clientY);
      const elementId = findElementWithPrecision(e.clientX, e.clientY);

      if (elementId !== hoveredElementId) {
        setHoveredElementId(elementId);

        // 디버깅 정보 출력
        if (elementId) {
          const element = parsedJson.elements?.find(
            (el) => el.id === elementId
          );
          const bounds = getElementBoundsInScreenCoords(elementId);

          console.log("정밀 매칭 결과:", {
            elementId,
            content: element?.content?.substring(0, 30),
            bbox: element?.bbox,
            screenBounds: bounds,
          });
        }
      }
    },
    [findElementWithPrecision, hoveredElementId, getElementBoundsInScreenCoords]
  );

  // useEffect(() => {
  //   window.addEventListener("resize", handleWindowResize);
  //   return () => {
  //     window.removeEventListener("resize", handleWindowResize);
  //   };
  // }, []);

  return (
    <div>
      {/* <div
        className={`fixed top-0 bg-gray-50 w-full z-20 h-10 flex items-center justify-center font-semibold transition-opacity ease-in-out delay-150 duration-300 ${
          isToolbarShown ? "opacity-100" : "opacity-0"
        }`}
        ref={docContainerRef}
      ></div> */}
      <div
        className="grid grid-cols-2 min-h-screen max-h-screen relative w-full relative"

        // ref={pageContainerRef}
      >
        <Document file={fileSource}>
          {[pageNumber].map((page, idx) => (
            <div
              key={idx}
              className={` flex max-h-screen overflow-y-scroll ${
                idx === 1 ? "justify-start" : "justify-end"
              } items-center`}
            >
              <Page
                key={idx}
                pageNumber={page}
                scale={scale}
                loading={""}
                onMouseMove={handleMouseMove}
                // onLoadSuccess={handleResize}
                onLoadSuccess={handlePageLoadSuccess}
                className={"relative"}
                inputRef={setContainerRef}

                // height={clientHeight}
                // width={containerWidth}
              >
                {/** 반투명 오버레이 */}
                <div
                  className="absolute bg-blue-200/40"
                  style={{
                    ...overlayStyle,
                  }}
                />
              </Page>
            </div>
          ))}
        </Document>
        <ParsedDocument paredJson={parsedJson} />
      </div>
      <div />
    </div>
  );
}
