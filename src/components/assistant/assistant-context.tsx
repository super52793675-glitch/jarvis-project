import type { Locale } from "@/lib/i18n";
import { createContext, useContext, type RefObject } from "react";

export type Tab = "talk" | "translate" | "control" | "me";
export type Status = "idle" | "listening" | "thinking" | "speaking";
export type Tool = "dial" | "sms" | "calc" | "camera" | null;

export type AssistantUi = {
  tab: Tab;
  setTab: (tab: Tab) => void;
  status: Status;
  listening: boolean;
  live: string;
  speechError: boolean;
  toggleListen: () => void;
  runText: (text: string) => void;
  openApp: (id: string) => void;
  startTimer: (seconds: number) => void;
  tool: Tool;
  setTool: (tool: Tool) => void;
  torchOn: boolean;
  stream: MediaStream | null;
  closeTool: () => void;
  trFrom: Locale | "auto";
  trTo: Locale;
  setTrFrom: (locale: Locale | "auto") => void;
  setTrTo: (locale: Locale) => void;
  trSource: string;
  setTrSource: (text: string) => void;
  trResult: string;
  trBusy: boolean;
  swapLanguages: () => void;
  interpreter: boolean;
  setInterpreter: (on: boolean) => void;
  speakText: (text: string, locale: Locale) => void;
  now: number | null;
  composerRef: RefObject<HTMLInputElement | null>;
  forgetArmed: boolean;
  armForget: () => void;
  confirmForget: () => void;
};

const Ctx = createContext<AssistantUi | null>(null);

export const AssistantProvider = Ctx.Provider;

export function useAssistant() {
  const value = useContext(Ctx);
  if (!value) throw new Error("Assistant UI is only available inside the app shell.");
  return value;
}
