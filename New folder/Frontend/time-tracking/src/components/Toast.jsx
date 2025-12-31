import { useEffect } from "react";

export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    if (!message) return;
    const id = setTimeout(() => onClose && onClose(), 3500);
    return () => clearTimeout(id);
  }, [message, onClose]);

  if (!message) return null;

  const bg = type === "error" ? "bg-red-600" : type === "success" ? "bg-green-600" : "bg-blue-600";

  return (
    <div className={`fixed top-6 right-6 ${bg} text-white px-4 py-2 rounded shadow-lg z-50`}>
      <div className="flex items-center space-x-3">
        <div className="text-sm">{message}</div>
        <button onClick={() => onClose && onClose()} className="ml-2 opacity-80 hover:opacity-100">✕</button>
      </div>
    </div>
  );
}
