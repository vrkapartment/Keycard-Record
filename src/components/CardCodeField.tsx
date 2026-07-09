"use client";

import { useId, useRef, useState } from "react";

type ScanStatus = "idle" | "scanning" | "success" | "error";

export function CardCodeField({
  defaultValue,
  placeholder,
  autoFocus,
}: {
  defaultValue?: string;
  placeholder?: string;
  autoFocus?: boolean;
}) {
  const id = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<ScanStatus>("idle");
  const [message, setMessage] = useState("");

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file) return;

    setStatus("scanning");
    setMessage("กำลังอ่านตัวเลขจากรูป…");

    try {
      const { createWorker, PSM } = await import("tesseract.js");
      const worker = await createWorker("eng");
      await worker.setParameters({
        tessedit_char_whitelist: "0123456789",
        tessedit_pageseg_mode: PSM.SINGLE_LINE,
      });
      const { data } = await worker.recognize(file);
      await worker.terminate();

      const digitsOnly = data.text.replace(/\D/g, "");
      const match = digitsOnly.match(/\d{5}/);

      if (match) {
        if (inputRef.current) inputRef.current.value = match[0];
        setStatus("success");
        setMessage(`อ่านได้: ${match[0]} — กรุณาตรวจสอบก่อนบันทึก`);
      } else if (digitsOnly) {
        if (inputRef.current) inputRef.current.value = digitsOnly.slice(0, 5);
        setStatus("error");
        setMessage("อ่านได้ไม่ครบ 5 หลัก กรุณาตรวจสอบและแก้ไข");
      } else {
        setStatus("error");
        setMessage("ไม่พบตัวเลขในรูป กรุณาถ่ายใหม่หรือกรอกเอง");
      }
    } catch {
      setStatus("error");
      setMessage("อ่านรูปไม่สำเร็จ กรุณาลองใหม่หรือกรอกเอง");
    }
  }

  return (
    <div>
      <div className="mb-1 flex items-center justify-between gap-2">
        <label className="block text-xs font-medium text-muted" htmlFor={id}>
          รหัสบัตร (5 หลัก)
        </label>
        <button
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={status === "scanning"}
          className="text-xs font-medium text-primary underline underline-offset-2 disabled:opacity-50"
        >
          {status === "scanning" ? "กำลังอ่าน…" : "ถ่ายรูปสแกน"}
        </button>
      </div>
      <input
        ref={inputRef}
        id={id}
        name="code"
        required
        pattern="\d{5}"
        maxLength={5}
        inputMode="numeric"
        defaultValue={defaultValue}
        placeholder={placeholder}
        autoFocus={autoFocus}
        className="w-full rounded-md border border-border-strong px-3 py-2.5 text-sm font-mono"
      />
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        capture="environment"
        onChange={handleFile}
        className="hidden"
      />
      {message && (
        <p
          className={`mt-1 text-xs ${status === "error" ? "text-inactive-text" : "text-muted"}`}
        >
          {message}
        </p>
      )}
    </div>
  );
}
