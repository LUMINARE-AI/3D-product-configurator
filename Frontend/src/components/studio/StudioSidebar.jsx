import { useEffect, useState } from "react";

export default function StudioSidebar({
  sidebarOpen,
  currentColor,
  selectedPart,
  setSelectedPart,
  parts,
  setParts, // must be passed from parent
  onApply,
}) {
  const colors = [
    "#ef4444",
    "#f97316",
    "#f59e0b",
    "#22c55e",
    "#09bce4",
    "#3b82f6",
    "#8b5cf6",
    "#ec4899",
    "#111827",
    "#6b7280",
  ];

  const [customColor, setCustomColor] = useState(currentColor);
  const [editingPartName, setEditingPartName] = useState("");

  // Sync custom color with parent
  useEffect(() => {
    setCustomColor(currentColor);
  }, [currentColor]);

  // Update input when selectedPart changes
  useEffect(() => {
    if (selectedPart) setEditingPartName(selectedPart);
    else setEditingPartName("");
  }, [selectedPart]);

  const applyColor = () => {
    if (selectedPart) onApply(selectedPart, customColor);
  };

  const savePartName = () => {
    if (!selectedPart) return;
    const updatedParts = parts.map((part) =>
      part === selectedPart ? editingPartName : part
    );
    setParts(updatedParts);
    setSelectedPart(editingPartName); // update selection
  };

  return (
    <aside
      className={`font-montserrat fixed top-0 right-0 h-full w-80 shadow-2xl border-l border-slate-700 z-[100]
      bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 text-white overflow-y-auto transition-transform duration-300
      ${sidebarOpen ? "translate-x-0" : "translate-x-full"}`}
    >
      <div className="p-6 space-y-6">
        {/* Header */}
        <div>
          <h2 className="text-2xl font-bold text-white">Customization</h2>
          <p className="text-sm text-slate-300 mt-1">Choose part and color</p>
        </div>

        {/* Select Part */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white">Select Part</label>
          <select
            value={selectedPart || ""}
            onChange={(e) => {
              setSelectedPart(e.target.value);
              setEditingPartName(e.target.value);
            }}
            className="cursor-pointer w-full p-3 rounded-lg bg-slate-700/80 border border-slate-600 text-white
            focus:border-[#52B0FF] focus:ring-2 focus:ring-[#52B0FF]/30 focus:outline-none transition-all"
          >
            <option value="" disabled>
              Choose a part
            </option>
            {Array.isArray(parts) &&
              parts.map((part, index) => (
                <option className="cursor-pointer" key={index} value={part}>
                  {part}
                </option>
              ))}
          </select>

          {/* Editable input with Save button */}
          {selectedPart && (
            <div className="mt-2 flex items-center gap-2">
              <input
                type="text"
                value={editingPartName}
                onChange={(e) => setEditingPartName(e.target.value)}
                className="flex-1 p-3 rounded-lg bg-slate-700/80 border border-slate-600 text-white
                focus:border-[#52B0FF] focus:ring-2 focus:ring-[#52B0FF]/30 focus:outline-none transition-all"
              />
              <button
                onClick={savePartName}
                className="px-2 py-2 bg-gradient-to-r from-[#0055B1] to-[#52B0FF] rounded-lg text-white font-semibold
                hover:shadow-lg hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-95"
              >
                Save
              </button>
            </div>
          )}
        </div>

        {/* Color Palette */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white">Color Palette</label>
          <div className="grid grid-cols-5 gap-2">
            {colors.map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => setCustomColor(c)}
                className={`h-10 w-10 cursor-pointer rounded-lg transition-all ${
                  c === customColor
                    ? "ring-2 ring-white ring-offset-2 ring-offset-slate-800 scale-110"
                    : "hover:scale-105"
                }`}
                style={{ background: c }}
              />
            ))}
          </div>
        </div>

        {/* Custom Color */}
        <div className="space-y-2">
          <label className="text-sm font-semibold text-white">Custom Color</label>
          <input
            type="text"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            placeholder="#004aad"
            className="w-full p-3 rounded-lg bg-slate-700/80 border border-slate-600 text-white 
            placeholder:text-slate-400 focus:border-[#52B0FF] focus:ring-2 focus:ring-[#52B0FF]/30 focus:outline-none transition-all font-mono"
          />
          <input
            type="color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
            className="w-full h-12 rounded-lg cursor-pointer border-2 border-slate-600 hover:border-[#52B0FF] transition-all"
          />
        </div>

        {/* Apply Button */}
        <button
          onClick={applyColor}
          disabled={!selectedPart}
          className="cursor-pointer w-full py-3 rounded-lg font-semibold text-white transition-all
          bg-gradient-to-r from-[#0055B1] to-[#52B0FF] 
          hover:shadow-lg hover:shadow-blue-500/50 hover:scale-[1.02] active:scale-95
          disabled:from-slate-700 disabled:to-slate-700 disabled:cursor-not-allowed disabled:opacity-50 disabled:hover:scale-100"
        >
          Apply Color
        </button>
      </div>
    </aside>
  );
}
