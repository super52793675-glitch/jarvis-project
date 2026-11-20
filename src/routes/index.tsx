import { AssistantApp } from "@/components/assistant/assistant-app";
import { createFileRoute } from "@tanstack/react-router";

export const Route = createFileRoute("/")({ component: Home });

function Home() {
  return <AssistantApp />;
}
