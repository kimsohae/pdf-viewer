// 유틸리티 타입들
export type ContentLayer = "furniture" | "body";
export type ElementLabel =
  | "page_header"
  | "list"
  | "picture"
  | "table"
  | "list_item"
  | "unspecified"
  | "text";
export type CoordinateOrigin =
  | "BOTTOMLEFT"
  | "TOPLEFT"
  | "BOTTOMRIGHT"
  | "TOPRIGHT";

// 문서 요소 통합 타입 정의
export type ParsedDocument = {
    schema_name: string;
    version: string;
    name: string;
    origin: {
      mimetype: string;
      binary_hash: number;
      filename: string;
    };
    key_value_items: any[];
    form_items: any[];
    furniture: DocumentElement;
    body: DocumentElement;
    groups: GroupElement[];
    texts: TextElement[];
    pictures: PictureElement[];
    tables: TableElement[];
  };

/**
 * 바운딩 박스 좌표 정보
 */
export interface BoundingBox {
  /** 왼쪽 좌표 */
  l: number;
  /** 상단 좌표 */
  t: number;
  /** 오른쪽 좌표 */
  r: number;
  /** 하단 좌표 */
  b: number;
  /** 좌표계 원점 */
  coord_origin: CoordinateOrigin;
}

/**
 * 요소의 위치 및 출처 정보
 */
export interface ElementProvenance {
  /** 페이지 번호 */
  page_no: number;
  /** 바운딩 박스 좌표 */
  bbox: BoundingBox;
  /** 문자 범위 [시작, 끝] */
  charspan: [number, number];
}

/**
 * 참조 객체 타입
 */
export interface ReferenceObject {
  $ref: string;
}

/**
 * 테이블 셀 정보
 */
export interface TableCell {
  /** 셀의 바운딩 박스 */
  bbox: BoundingBox;
  /** 행 병합 수 */
  row_span: number;
  /** 열 병합 수 */
  col_span: number;
  /** 시작 행 인덱스 */
  start_row_offset_idx: number;
  /** 끝 행 인덱스 */
  end_row_offset_idx: number;
  /** 시작 열 인덱스 */
  start_col_offset_idx: number;
  /** 끝 열 인덱스 */
  end_col_offset_idx: number;
  /** 셀 텍스트 내용 */
  text: string;
  /** 열 헤더 여부 */
  column_header: boolean;
  /** 행 헤더 여부 */
  row_header: boolean;
  /** 행 섹션 여부 */
  row_section: boolean;
}

/**
 * 테이블 데이터 구조
 */
export interface TableData {
  /** 테이블 셀들의 배열 */
  table_cells: TableCell[];
}

/**
 * 기본 문서 요소 (공통 속성)
 */
export interface BaseDocumentElement {
  /** 자기 참조 ID */
  self_ref: string;
  /** 부모 요소에 대한 참조 */
  parent: ReferenceObject;
  /** 자식 요소들의 배열 */
  children: ReferenceObject[];
  /** 컨텐츠 레이어 타입 */
  content_layer: ContentLayer;
  /** 요소의 라벨/유형 */
  label: string;
  /** 요소의 위치 및 출처 정보 배열 */
  prov: ElementProvenance[];
}

/**
 * 텍스트 요소
 */
export interface TextElement extends BaseDocumentElement {
  label: 'text';
  /** 원본 텍스트 */
  orig: string;
  /** 처리된/정규화된 텍스트 */
  text: string;
}

/**
 * 테이블 요소
 */
export interface TableElement extends BaseDocumentElement {
  label: "table";
  /** 캡션들 */
  captions: DocumentElement[];
  /** 참조들 */
  references: DocumentElement[];
  /** 각주들 */
  footnotes: DocumentElement[];
  /** 테이블 데이터 */
  data: TableData;
}

/**
 * 그룹 요소 타입
 */
export interface GroupElement extends BaseDocumentElement {
  label: "list";
  /** 그룹명 */
  name: string;
}

/**
 * 리스트 아이템 요소 (TextElement 확장)
 */
export interface ListItemElement extends BaseDocumentElement {
  label: "list_item";
  /** 번호 매김 여부 */
  enumerated: boolean;
  /** 리스트 마커 */
  marker: string;
}

export interface PictureElement extends BaseDocumentElement {
  label: 'picture';
  /** 캡션들 */
  captions: DocumentElement[];
  /** 참조들 */
  references: DocumentElement[];
  /** 각주들 */
  footnotes: DocumentElement[];
  /** 이미지 데이터 */
  image: ImageData;
}


/**
 * 통합 문서 요소 타입
 */
export type DocumentElement = TextElement | TableElement | GroupElement | ListItemElement | PictureElement;

export type ElementParent = (GroupElement | PictureElement)[]

// 타입 가드 함수들

export function isDocumentElement(
  element: { [key: string]: any }
): element is DocumentElement {
  return "label" in element;
}

export function isReferenceObject(
  element: { [key: string]: any }
): element is ReferenceObject {
  return "$ref" in element;
}

export function isTextElement(
  element: DocumentElement
): element is TextElement {
  return element.label !== "table";
}

export function isTableElement(
  element: DocumentElement
): element is TableElement {
  return element.label === "table";
}


export function isGroupElement(element: DocumentElement): element is GroupElement {
    return 'name' in element && (element.label === 'list');
  }
  
export function isListItemElement(element: DocumentElement): element is ListItemElement {
    return element.label === 'list_item';
  }