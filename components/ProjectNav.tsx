// components/ProjectNav.tsx
import { BookOpen, FileText, Download } from "lucide-react";

interface Props {
  activeItem: string;
  onNavigate: (id: string) => void;
}

const items = [
  { id: "project", label: "我的项目", icon: <BookOpen className="w-[18px]" strokeWidth={1.5} /> },
  { id: "drafts", label: "草稿", icon: <FileText className="w-[18px]" strokeWidth={1.5} /> },
  { id: "exports", label: "导出记录", icon: <Download className="w-[18px]" strokeWidth={1.5} /> },
];

export default function ProjectNav({ activeItem, onNavigate }: Props) {
  return (
    <div className="space-y-0.5 px-2">
      {items.map((item) => (
        <button
          key={item.id}
          onClick={() => onNavigate(item.id)}
          className={`flex items-center gap-2.5 w-full px-4 py-2.5 text-[14px] rounded-lg transition-all ${
            activeItem === item.id
              ? "bg-[rgba(0,113,227,0.1)] text-[var(--apple-blue)] font-medium"
              : "text-[var(--apple-text)] hover:bg-[rgba(0,0,0,0.04)]"
          }`}
        >
          {item.icon}
          {item.label}
        </button>
      ))}
    </div>
  );
}
