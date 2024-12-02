import React from 'react';
import { X } from 'lucide-react';


export const NoteCard =({
  content,
  author,
  position,
  onClick,
  isOpen,
  onClose,
}) => {
  if (isOpen) {
    return (
      <div 
        className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
        onClick={onClose}
      >
        <div 
          className="bg-red-100 p-6 rounded-lg shadow-xl max-w-md w-full mx-4 relative transform rotate-[-2deg]"
          onClick={(e) => e.stopPropagation()}
        >
          <button
            onClick={onClose}
            className="absolute top-2 right-2 text-red-800 hover:text-red-600"
          >
            <X size={20} />
          </button>
          <div className="font-handwriting text-lg text-red-800">{content}</div>
          <div className="mt-4 text-right font-handwriting text-sm text-red-700">- {author}</div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="absolute cursor-pointer transform hover:scale-110 transition-transform"
      style={{
        left: `${position.x}%`,
        top: `${position.y}%`,
        transform: 'translate(-50%, -50%)'
      }}
      onClick={onClick}
    >
      <div className="w-10 h-10 bg-red-100 rounded-lg shadow-md transform rotate-[-2deg] hover:rotate-2 transition-transform">
        <div className="w-full h-full flex items-center justify-center">
          📝
        </div>
      </div>
    </div>
  );
}