"use client";

import { useId, useRef, useState } from "react";

type ScanStatus = "idle" | "scanning" | "success" | "error";

const ROTATIONS = [0, 90, 180, 270] as const;
const MAX_DIMENSION = 1600;

async function loadScaledBitmap(file: File): Promise<ImageBitmap> {
  const original = await createImageBitmap(file);
  const scale = Math.min(1, MAX_DIMENSION / Math.max(original.width, original.height));
  if (scale === 1) return original;

  const scaled = await createImageBitmap(original, {
    resizeWidth: Math.round(original.width * scale),
    resizeHeight: Math.round(original.height * scale),
  });
  original.close();
  return scaled;
}

function rotateBitmap(bitmap: ImageBitmap, angleDeg: number): Promise<Blob> {
  const swap = angleDeg === 90 || angleDeg === 270;
  const canvas = document.createElement("canvas");
  canvas.width = swap ? bitmap.height : bitmap.width;
  canvas.height = swap ? bitmap.width : bitmap.height;
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("canvas unsupported");

  ctx.translate(canvas.width / 2, canvas.height / 2);
  ctx.rotate((angleDeg * Math.PI) / 180);
  ctx.drawImage(bitmap, -bitmap.width / 2, -bitmap.height / 2);

  return new Promise((resolve, reject) => {
    canvas.toBlob(
      (blob) => (blob ? resolve(blob) : reject(new Error("toBlob failed"))),
      "image/png"
    );
  });
}

// Prox cards typically print "<facility code>.<card number>" (e.g. "072.00536").
// Prefer that pattern's second group over a bare standalone run, since a lone
// 5-digit match could otherwise be a slice of an unrelated longer serial number.
function extractCode(text: string): string | null {
  const paired = text.match(/\d{1,3}[.\-\s]+(\d{5})(?!\d)/);
  if (paired) return paired[1];

  const standalone = text.match(/(?<!\d)\d{5}(?!\d)/);
  return standalone ? standalone[0] : null;
}

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
    setMessage("กำลังอ่านตัวเลขจากรูป… (ลองหลายมุมหมุน)");

    try {
      const { createWorker, PSM } = await import("tesseract.js");
      const worker = await createWorker("eng");
      await worker.setParameters({
        tessedit_char_whitelist: "0123456789.-",
        tessedit_pageseg_mode: PSM.SPARSE_TEXT,
      });

      const bitmap = await loadScaledBitmap(file);

      let bestCode: string | null = null;
      let bestConfidence = -1;
      let anyDigits = "";

      for (const angle of ROTATIONS) {
        const rotated = await rotateBitmap(bitmap, angle);
        const { data } = await worker.recognize(rotated);

        const digitsOnly = data.text.replace(/\D/g, "");
        if (digitsOnly.length > anyDigits.length) anyDigits = digitsOnly;

        const code = extractCode(data.text);
        if (code && data.confidence > bestConfidence) {
          bestCode = code;
          bestConfidence = data.confidence;
        }
      }

      bitmap.close();
      await worker.terminate();

      if (bestCode) {
        if (inputRef.current) inputRef.current.value = bestCode;
        setStatus("success");
        setMessage(`อ่านได้: ${bestCode} — กรุณาตรวจสอบก่อนบันทึก`);
      } else if (anyDigits) {
        if (inputRef.current) inputRef.current.value = anyDigits.slice(0, 5);
        setStatus("error");
        setMessage("อ่านได้ไม่ชัดเจน กรุณาตรวจสอบและแก้ไข");
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
          className="rounded-md bg-accent px-3 py-1.5 text-sm font-medium text-accent-ink hover:opacity-90 disabled:opacity-50"
        >
          {status === "scanning" ? "กำลังอ่าน…" : "เลือก/ถ่าย คีย์การ์ด"}
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
