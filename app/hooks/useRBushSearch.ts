import { useMemo } from "react";
import RBush from 'rbush';
import { findParentGroup, getGroupBoundingBox } from "@/utils/getGroupBoundingBox";
import type { ParsedDocument, BoundingBox } from "@/types/position";

interface IndexedItem {
  minX: number;
  minY: number;
  maxX: number;
  maxY: number;
  element: any;
}

export function useRBushSearch(parsedDoc: ParsedDocument) {
  const rtree = useMemo(() => {
    const tree = new RBush<IndexedItem>();
    const elements = [...parsedDoc.texts, ...parsedDoc.pictures, ...parsedDoc.tables];

    const items: IndexedItem[] = elements.map((el) => {
      const { l, r, t, b } = el.prov[0].bbox;
      return {
        minX: l,
        minY: b,
        maxX: r,
        maxY: t,
        element: el,
      };
    });
    tree.load(items);
    return tree;
  }, [parsedDoc]);

  const searchByPoint = (x: number, y: number): { jsonRef: string; pdfBbox: BoundingBox } | null => {
    const results = rtree.search({ minX: x, minY: y, maxX: x, maxY: y });
    if (results.length === 0) return null;

    const el = results[0].element;
    let prov = el.prov[0].bbox;
    const parentGroup = findParentGroup(el.self_ref);
    if (parentGroup) {
      const groupBbox = getGroupBoundingBox(parentGroup);
      if (groupBbox) prov = groupBbox;
    }
    return {
      jsonRef: parentGroup?.self_ref || el.self_ref,
      pdfBbox: prov,
    };
  };

  return {
    rtree,
    searchByPoint,
  };
}