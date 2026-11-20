import type { Locale } from "@/lib/i18n";
import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

export type ChatMessage = {
  id: string;
  role: "user" | "assistant";
  text: string;
  href?: string;
  hrefLabel?: string;
};

export type Fact = { id: string; text: string };
export type Contact = { id: string; name: string; phone: string };
export type Note = { id: string; text: string };
export type ReplyMode = "follow" | Locale;
export type TimerState = { endsAt: number; label?: string };

type LingxiState = {
  locale: Locale;
  replyMode: ReplyMode;
  voiceOn: boolean;
  handsFree: boolean;
  name: string;
  city: string;
  facts: Fact[];
  contacts: Contact[];
  notes: Note[];
  messages: ChatMessage[];
  timer: TimerState | null;
  setLocale: (locale: Locale) => void;
  setReplyMode: (mode: ReplyMode) => void;
  setVoiceOn: (on: boolean) => void;
  setHandsFree: (on: boolean) => void;
  setName: (name: string) => void;
  setCity: (city: string) => void;
  addFact: (text: string) => void;
  removeFact: (id: string) => void;
  addContact: (name: string, phone: string) => void;
  removeContact: (id: string) => void;
  addNote: (text: string) => void;
  removeNote: (id: string) => void;
  addMessage: (msg: Omit<ChatMessage, "id">) => string;
  clearMessages: () => void;
  setTimer: (timer: TimerState | null) => void;
  forgetMemory: () => void;
};

function uid() {
  return crypto.randomUUID();
}

export const useLingxi = create<LingxiState>()(
  persist(
    (set) => ({
      locale: "zh",
      replyMode: "follow",
      voiceOn: true,
      handsFree: false,
      name: "",
      city: "",
      facts: [],
      contacts: [],
      notes: [],
      messages: [],
      timer: null,
      setLocale: (locale) => set({ locale }),
      setReplyMode: (replyMode) => set({ replyMode }),
      setVoiceOn: (voiceOn) => set({ voiceOn }),
      setHandsFree: (handsFree) => set({ handsFree }),
      setName: (name) => set({ name: name.slice(0, 32) }),
      setCity: (city) => set({ city: city.slice(0, 32) }),
      addFact: (text) =>
        set((state) => ({
          facts: [{ id: uid(), text: text.slice(0, 160) }, ...state.facts].slice(0, 40),
        })),
      removeFact: (id) => set((state) => ({ facts: state.facts.filter((fact) => fact.id !== id) })),
      addContact: (name, phone) =>
        set((state) => ({
          contacts: [
            { id: uid(), name: name.slice(0, 32), phone: phone.slice(0, 24) },
            ...state.contacts,
          ].slice(0, 30),
        })),
      removeContact: (id) =>
        set((state) => ({ contacts: state.contacts.filter((contact) => contact.id !== id) })),
      addNote: (text) =>
        set((state) => ({
          notes: [{ id: uid(), text: text.slice(0, 280) }, ...state.notes].slice(0, 40),
        })),
      removeNote: (id) => set((state) => ({ notes: state.notes.filter((note) => note.id !== id) })),
      addMessage: (msg) => {
        const id = uid();
        set((state) => ({
          messages: [...state.messages, { ...msg, id, text: msg.text.slice(0, 2000) }].slice(-40),
        }));
        return id;
      },
      clearMessages: () => set({ messages: [] }),
      setTimer: (timer) => set({ timer }),
      forgetMemory: () => set({ name: "", city: "", facts: [], contacts: [], notes: [] }),
    }),
    {
      name: "lingxi-v1",
      skipHydration: true,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);
