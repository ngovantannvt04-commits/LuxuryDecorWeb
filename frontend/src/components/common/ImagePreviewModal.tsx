import { X } from "lucide-react";

interface ImagePreviewModalProps {
    src: string | null;
    onClose: () => void;
}

export default function ImagePreviewModal({ src, onClose }: ImagePreviewModalProps) {
    if (!src) return null;

    return (
        <div 
            className="fixed inset-0 z-[9999] flex items-center justify-center bg-black/80 backdrop-blur-sm animate-in fade-in duration-200"
            onClick={onClose} // Click ra ngoài thì đóng
        >
            {/* Nút đóng */}
            <button 
                className="absolute top-4 right-4 p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition z-50"
                onClick={onClose}
            >
                <X size={24} />
            </button>

            {/* Ảnh lớn */}
            <div 
                className="relative max-w-[90vw] max-h-[90vh] overflow-hidden rounded-lg shadow-2xl p-1"
                onClick={(e) => e.stopPropagation()} // Click vào ảnh thì không đóng
            >
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                    src={src} 
                    alt="Preview" 
                    className="max-w-full max-h-[90vh] object-contain rounded"
                />
            </div>
        </div>
    );
}