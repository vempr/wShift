import type { Route } from "./+types/home";

export function meta({}: Route.MetaArgs) {
  return [
    { title: "wShift" },
    { name: "description", content: "Document your work shifts as a flexible employee with wShift, a simple and convenient web application that runs offline and synchronizes between devices." },
  ];
}

export default function Home() {
  return <div>Hello!</div>;
}
