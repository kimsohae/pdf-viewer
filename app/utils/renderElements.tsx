import Group from "@/components/document/Group";
import Picture from "@/components/document/Picture";
import Table from "@/components/document/Table";
import Text from "@/components/document/Text";

export function resolveRef(path, root) {
  return path.reduce((obj, key) => obj[key], root);
}

export function parseRef(ref) {
  return ref.replace(/^#\//, "").split("/");
}

export function renderElement(ref, element, json) {
  // pathOrRef가 문자열이면 $ref 값이고, 배열이면 기존 path
  const path = typeof ref === "string" ? parseRef(ref) : ref;
  const type = path[0];

  if (type === "texts") {
    return <Text element={element} jsonRef={ref} />;
  }

  if (type === "groups") {
    return <Group element={element} json={json} />;
  }

  if (type === "pictures") {
    return <Picture element={element} json={json} />;
  }

  if (type === "tables") {
    return <Table table={element} />;
  }

  return null;
}
