import { UploadCloud } from "lucide-react";
import { useRef, useState, type DragEvent } from "react";
import { clsx } from "clsx";

export function FileDropzone({
  onFileSelected,
  accept,
  label,
}: {
  onFileSelected: (file: File) => void;
  accept?: string;
  label?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  function handleDrop(e: DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) onFileSelected(file);
  }

  return (
    <div
      onClick={() => inputRef.current?.click()}
      onDragOver={(e) => {
        e.preventDefault();
        setIsDragging(true);
      }}
      onDragLeave={() => setIsDragging(false)}
      onDrop={handleDrop}
      className={clsx(
        "flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl2 border-2 border-dashed px-6 py-10 text-center transition-colors",
        isDragging ? "border-sage-600 bg-sage-100/40" : "border-navy-100 hover:border-navy-400",
      )}
    >
      <UploadCloud className="h-7 w-7 text-navy-400" />
      <p className="text-sm font-medium text-navy-700">{label ?? "Drop a file here, or click to browse"}</p>
      <p className="text-xs text-navy-400">Images or PDF</p>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const file = e.target.files?.[0];
          if (file) onFileSelected(file);
        }}
      />
    </div>
  );
}
