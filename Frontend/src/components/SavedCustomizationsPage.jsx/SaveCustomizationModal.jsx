// src/components/SaveCustomizationModal.jsx
import { useState } from "react";

export default function SaveCustomizationModal({ isOpen, onClose, onSave }) {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-[200]">
      <div className="bg-white rounded-xl shadow-xl p-6 w-[400px]">
        <h2 className="text-xl font-bold mb-4">Save Customization</h2>

        <input
          type="text"
          placeholder="Enter name"
          className="w-full border px-3 py-2 rounded mb-3"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />

        <textarea
          placeholder="Enter description"
          className="w-full border px-3 py-2 rounded mb-3"
          rows={3}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
        />

        <div className="flex justify-end gap-3">
          <button
            className="px-4 py-2 bg-gray-300 rounded"
            onClick={onClose}
          >
            Cancel
          </button>
          <button
            className="px-4 py-2 bg-blue-600 text-white rounded"
            onClick={() => onSave({ name, description })}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
