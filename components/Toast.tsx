"use client";
import { useEffect, useState } from "react";
import { X } from "lucide-react";

interface Props {
  message: string;
  type?: "error" | "success";
  onClose: () => void;
}

export default function Toast({ message, type = "error", onClose }: Props) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    requestAnimationFrame(() => setVisible(true));
    const t = setTimeout(() => {
      setVisible(false);
      setTimeout(onClose, 300);
    }, 4000);
    return () => clearTimeout(t);
  }, [onClose]);

  return (
    <div
      className={`fixed top-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-lg transition-all duration-300 ${
        visible ? "opacity-100 translate-y-0" : "opacity-0 -translate-y-2"
      } ${
        type === "success"
          ? "bg-[#34c759] text-white"
          : "bg-[#ff3b30] text-white"
      }`}
    >
      <span className="text-[14px] font-medium">{message}</span>
      <button onClick={onClose} className="hover:opacity-70">
        <X className="w-4 h-4" strokeWidth={2} />
      </button>
    </div>
  );
}
