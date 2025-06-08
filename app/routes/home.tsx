import type { Route } from "./+types/home";
import Viewer from "@/components/Viewer";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "사전 과제" },
    { name: "description", content: "PDF viewer" },
  ];
}

export default function Home() {
  // return <></>;
  return <Viewer />;
}
