import { useAssistant } from "@/components/assistant/assistant-context";
import { safeCalc } from "@/lib/assistant/intent";
import { copy, formatNumber } from "@/lib/i18n";
import { useLingxi } from "@/lib/assistant/store";
import { Delete } from "lucide-react";
import { useState } from "react";

const KEYS = ["7", "8", "9", "÷", "4", "5", "6", "×", "1", "2", "3", "−", "0", ".", "=", "+"] as const;

export function CalcPad() {
  const locale = useLingxi((state) => state.locale);
  const dict = copy[locale];
  const { closeTool } = useAssistant();
  const [expr, setExpr] = useState("");
  const [shown, setShown] = useState("0");

  function press(key: string) {
    if (key === "=") {
      const value = safeCalc(expr);
      setShown(value == null ? dict.calcBad : formatNumber(value));
      if (value != null) setExpr(formatNumber(value));
      return;
    }
    const next = `${expr}${key === "×" ? "*" : key === "÷" ? "/" : key === "−" ? "-" : key}`;
    setExpr(next);
    setShown(next);
  }

  return (
    <section className="max-h-[46%] overflow-y-auto border-t border-line bg-surface px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-right font-display text-3xl tabular-nums">{shown}</p>
        <button type="button" className="h-11 rounded-full px-4 text-sm text-muted" onClick={closeTool}>
          {dict.close}
        </button>
      </div>
      <div className="grid grid-cols-4 gap-2">
        {KEYS.map((key) => (
          <button
            key={key}
            type="button"
            className="h-12 rounded-2xl bg-raised text-lg text-fg"
            onClick={() => press(key)}
          >
            {key}
          </button>
        ))}
        <button type="button" className="col-span-4 h-11 rounded-2xl text-sm text-muted" onClick={() => { setExpr(""); setShown("0"); }}>
          {dict.cancel}
        </button>
      </div>
    </section>
  );
}

export function DialPad({ mode }: { mode: "dial" | "sms" }) {
  const locale = useLingxi((state) => state.locale);
  const dict = copy[locale];
  const { closeTool } = useAssistant();
  const [number, setNumber] = useState("");
  const keys = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "*", "0", "#"];

  return (
    <section className="max-h-[46%] overflow-y-auto border-t border-line bg-surface px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <p className="min-w-0 flex-1 truncate text-center text-2xl tabular-nums">{number || dict.dialPh}</p>
        <button type="button" className="grid size-11 place-items-center text-muted" onClick={() => setNumber((value) => value.slice(0, -1))} aria-label={dict.cancel}>
          <Delete className="size-5" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-2">
        {keys.map((key) => (
          <button
            key={key}
            type="button"
            className="h-12 rounded-2xl bg-raised text-lg"
            onClick={() => setNumber((value) => `${value}${key}`.slice(0, 20))}
          >
            {key}
          </button>
        ))}
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2">
        <a className="flex h-12 items-center justify-center rounded-full bg-accent font-medium text-ink" href={number ? `tel:${number}` : "#"}>
          {dict.call}
        </a>
        <a
          className="flex h-12 items-center justify-center rounded-full border border-line font-medium"
          href={number ? `sms:${number}` : "#"}
        >
          {mode === "sms" ? dict.text : dict.text}
        </a>
      </div>
      <button type="button" className="mt-2 h-11 w-full text-sm text-muted" onClick={closeTool}>
        {dict.close}
      </button>
    </section>
  );
}
