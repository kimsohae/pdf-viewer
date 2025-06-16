import { isDocumentElement, type BoundingBox, type DocumentElement, type GroupElement, type ParsedDocument, type ReferenceObject } from "@/types/document";

/**
 * 요소 ID로 문서에서 요소를 찾는 함수
 * @param elements  탐색 대상 DcoumentElement[]
 * @param targetRef 요소의 self_ref
 * @returns 
 */
 export function findElementById( elements: DocumentElement[], targetRef: string ): DocumentElement | DocumentElement[] | ReferenceObject[]| null {  
  if(targetRef === '#/body') return elements;

    for (const element of elements) {
      if (element.self_ref === targetRef) {
        return element;
      }
      // 재귀적으로 자식에서도 검색 
      if (element.children && element.children.length > 0) {
        const isFound = Boolean(element.children.some((child)=> child.$ref === targetRef)) ;
        if (isFound) return element;
      }
    }
    return null;
  }
  
  /**
   * 주어진 요소의 부모 요소를 찾는 함수 
   * @param elements  탐색 대상 DcoumentElement[]
   * @param targetRef 요소의 self_ref
   * @returns 
   */
  export function findParentGroup(elements: DocumentElement[], targetRef: string): GroupElement | null {
    const targetElement = findElementById(elements, targetRef);
    if (!targetElement) return null;
    return targetElement as GroupElement;
  }


  
  /**
   * 여러 바운딩 박스를 감싸는 최소 바운딩 박스 계산
   */
  function calculateBoundingBox(bboxes: BoundingBox[]): BoundingBox | null {
    if (bboxes.length === 0) return null;
    
    // 첫 번째 박스로 초기화
    let minL = bboxes[0].l;
    let minT = bboxes[0].t;
    let maxR = bboxes[0].r;
    let maxB = bboxes[0].b;
    const coordOrigin = bboxes[0].coord_origin;
    
    // 모든 박스를 순회하면서 최소/최대 값 찾기
    for (const bbox of bboxes) {
      minL = Math.min(minL, bbox.l);
      maxR = Math.max(maxR, bbox.r);
      maxB = Math.min(maxB, bbox.b);
      minT = Math.max(minT, bbox.t);
    }
    
    return {
      l: minL,
      t: minT,
      r: maxR,
      b: maxB,
      coord_origin: coordOrigin
    };
  }

/**
 * 그룹의 모든 자식 요소들을 감싸는 바운딩 박스 계산
 */
 export function getGroupBoundingBox(
    json: ParsedDocument,
    parentGroup: DocumentElement
  ): BoundingBox | null {


    // 2. 그룹의 모든 자식 요소들 수집
    const childElements: DocumentElement[] = [];
    for (const childRef of parentGroup.children) {
      const childElement = findElementById(json.texts, childRef.$ref );
      if (childElement && isDocumentElement(childElement)) {
        childElements.push(childElement);
      }
    }
    
    // 3. 자식 요소들의 바운딩 박스 수집
    const bboxes: BoundingBox[] = [];
    for (const child of childElements) {
      if ('prov' in child && child.prov && child.prov.length > 0) {
        // 각 요소의 모든 prov에서 bbox 수집
        for (const prov of child.prov) {
          bboxes.push(prov.bbox);
        }
      }
    }
    
    // 4. 통합 바운딩 박스 계산
    return calculateBoundingBox(bboxes);
  }
