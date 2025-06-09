import type { Route } from "./+types/home";
import Viewer from "@/components/Viewer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "PDF  - Document 양방향 인터랙션 " },
    { name: "description", content: "PDF - Document 양방향 인터랙션" },
  ];
}

export default function Home() {
  return <Viewer />;
}
