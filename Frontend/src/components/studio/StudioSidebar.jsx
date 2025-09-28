import { useEffect, useState } from "react";

export default function StudioSidebar({ sidebarOpen, currentColor, setCurrentColor, selectedPart }) {
  const colors = [
    "#ef4444", "#f97316", "#f59e0b", "#22c55e",
    "#09bce4ff", "#3b82f6", "#8b5cf6", "#ec4899",
    "#111827", "#6b7280"
  ];

  const [customColor, setCustomColor] = useState(currentColor);

  useEffect(() => {
    setCustomColor(currentColor);
  }, [currentColor]);

  const safeSetColor = (val) => {
    if (typeof setCurrentColor === "function") setCurrentColor(val);
    else console.warn("StudioSidebar: setCurrentColor not provided");
  };

  const handleHexInput = (e) => {
    const v = e.target.value;
    setCustomColor(v);
    if (/^#([0-9A-F]{3}){1,2}$/i.test(v)) safeSetColor(v);
  };

  return (
    <aside
      className={`font-montserrat fixed top-0 right-0 h-full w-80 p-6 shadow-xl border-l border-zinc-700 z-[100]
      bg-black/30 backdrop-blur-md text-white overflow-y-auto transition-transform duration-300
      ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <h2 className="text-lg font-semibold mb-4">Customization</h2>

      {selectedPart && (
        <p className="text-sm font-medium mb-4">
          Selected Part: <span className="text-pink-400">{selectedPart}</span>
        </p>
      )}

      <div className="flex flex-wrap gap-3 mb-6">
        {colors.map((c) => (
          <button
            key={c}
            type="button"
            onClick={() => {
              setCustomColor(c);
              safeSetColor(c);
            }}
            className="h-10 w-10 rounded-lg border-2"
            style={{
              background: c,
              borderColor: c === currentColor ? "white" : "transparent"
            }}
          />
        ))}
      </div>

      <div className="flex flex-col gap-2">
        <label className="text-sm">Custom Color (HEX):</label>
        <input
          type="text"
          value={customColor}
          onChange={handleHexInput}
          placeholder="#004aad"
          className="p-2 rounded bg-zinc-800 border border-zinc-600 text-white outline-none"
        />
        <input
          type="color"
          value={currentColor}
          onChange={(e) => {
            setCustomColor(e.target.value);
            safeSetColor(e.target.value);
          }}
          className="w-full h-10 rounded cursor-pointer"
        />
      </div>
    </aside>
  );
}
