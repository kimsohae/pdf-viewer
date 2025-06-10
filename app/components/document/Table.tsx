import {
  useHighlightAction,
  useHighlightValue,
} from "@/contexts/HighlightContext";
import { useScrollToHighlighted } from "@/hooks/useScrollToHighlighted";
import type { TableElement } from "@/types/document";
import { Element } from "react-scroll";

interface Props {
  table: TableElement;
}

interface CellType {
  text: string;
  rowSpan: number;
  colSpan: number;
}

export default function Table({ table }: Props) {
  const { jsonRef: highlightedRef } = useHighlightValue();
  const updatePosition = useHighlightAction();
  const isHighlighted = useScrollToHighlighted({
    highlightedRef,
    selfRef: table.self_ref,
  });

  const cells = table.data?.table_cells;
  if (!cells || cells.length === 0) return <div>[Empty Table]</div>;

  let maxRow = 0;
  let maxCol = 0;
  cells.forEach((cell) => {
    maxRow = Math.max(maxRow, cell.end_row_offset_idx);
    maxCol = Math.max(maxCol, cell.end_col_offset_idx);
  });

  const grid: (CellType | null)[][] = Array.from({ length: maxRow }, () =>
    Array.from({ length: maxCol }, () => null)
  );

  cells.forEach((cell) => {
    const {
      text,
      row_span,
      col_span,
      start_row_offset_idx,
      start_col_offset_idx,
    } = cell;
    grid[start_row_offset_idx][start_col_offset_idx] = {
      text,
      rowSpan: row_span,
      colSpan: col_span,
    };
  });

  const handleClick = () => {
    updatePosition({
      jsonRef: table.self_ref,
      pdfBbox: table.prov[0].bbox,
    });
  };

  return (
    <Element name={isHighlighted ? "highlightedJson" : ""}>
      <div
        className={`overflow-x-auto my-4 ${
          highlightedRef === table.self_ref ? "bg-yellow-200" : ""
        }`}
      >
        <table
          className="table-auto border border-gray-400 w-full text-sm"
          onClick={handleClick}
        >
          <tbody>
            {grid.map((row, rowIndex) => (
              <tr key={rowIndex} className="border-t border-gray-300">
                {row.map((cell, colIndex) => {
                  if (!cell) return <td key={colIndex} />;
                  return (
                    <td
                      key={colIndex}
                      rowSpan={cell.rowSpan > 1 ? cell.rowSpan : undefined}
                      colSpan={cell.colSpan > 1 ? cell.colSpan : undefined}
                      className="border border-gray-300 p-2 align-top"
                    >
                      {cell.text}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Element>
  );
}
