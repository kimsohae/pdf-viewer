## PDF Interactive Viewer

PDF 문서와 해당 문서를 파싱한 JSON 데이터를 연결하여 양방향 인터랙션을 지원하는 React 기반 웹 뷰어 프로젝트입니다. PDF 마우스 오버, 문서 클릭을 통해 PDF 문서와 JSON 데이터를 하이라이팅하며 탐색할 수 있습니다.

## 주요 기능

### ✅ 양방향 하이라이트

- PDF 영역을 마우스로 가리키면 관련된 JSON 요소가 강조 표시됩니다.

- JSON 요소를 클릭하면 PDF 상 해당 위치로 스크롤 및 강조됩니다.

### ✅ 성능 최적화

- 대용량 문서에서도 빠른 검색이 가능하도록 RBush 공간 인덱싱 적용
- 마우스 이벤트 throttling 적용으로 렌더링 부하 감소

### ✅ 오류 대응

- PDF 파일 로딩 실패 시 fallback UI 제공

### ✅ 코드 구조화

핵심 로직은 다음과 같이 기능별 Hook으로 분리하였습니다.

- useViewport: PDF.js Viewport 관리

- useRBushSearch: RBush 공간 인덱싱 및 탐색

- useScrollToHighlighted: 강조 요소 자동 스크롤

## 사용 기술

- React 

- react-pdf 

- Tailwind CSS

- react-scroll

- rbush (공간 인덱싱)

## 프로젝트 구조

```
├── components
│ └── document // 파싱된 문서 렌더링(group, picture, table, text 분리)
│ ├── Pdf.tsx // PDF 렌더링 및 마우스 상호작용
│ ├── Viewer.tsx // Viewer 레이아웃
│
├── hooks
│ ├── useViewport.ts // 첫 페이지 Viewport 저장
│ ├── useRBushSearch.ts // RBush 인덱싱 및 검색
│ ├── useScrollToHighlighted.ts // Document에서 활용: 요소 클릭 시 pdf 이동
│
├── contexts
│ └── HighlightContext.tsx // 현재 하이라이트된 요소 상태관리
│
├── types
│ └── position.ts // 파싱된 document 타입 정의
```

## 실행 방법

```
npm install
npm run dev
```
