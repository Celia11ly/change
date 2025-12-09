import { useState, useRef, useEffect, useCallback } from "react";
import { GripVertical } from "lucide-react";

interface ComparisonSliderProps {
    imageSrc: string;
    videoSrc: string;
    className?: string;
}

export function ComparisonSlider({ imageSrc, videoSrc, className = "" }: ComparisonSliderProps) {
    const [sliderParams, setSliderParams] = useState({
        isResizing: false,
        position: 50, // percentage
    });
    const containerRef = useRef<HTMLDivElement>(null);

    const handlePointerDown = useCallback(() => {
        setSliderParams((prev) => ({ ...prev, isResizing: true }));
    }, []);

    const handlePointerUp = useCallback(() => {
        setSliderParams((prev) => ({ ...prev, isResizing: false }));
    }, []);

    const handlePointerMove = useCallback(
        (e: MouseEvent | TouchEvent) => {
            if (!sliderParams.isResizing || !containerRef.current) return;

            const rect = containerRef.current.getBoundingClientRect();
            let clientX;

            if ('touches' in e) {
                clientX = e.touches[0].clientX;
            } else {
                clientX = (e as MouseEvent).clientX;
            }

            const x = Math.max(0, Math.min(clientX - rect.left, rect.width));
            const percentage = (x / rect.width) * 100;

            setSliderParams((prev) => ({ ...prev, position: percentage }));
        },
        [sliderParams.isResizing]
    );

    useEffect(() => {
        document.addEventListener("mouseup", handlePointerUp);
        document.addEventListener("touchend", handlePointerUp);
        document.addEventListener("mousemove", handlePointerMove);
        document.addEventListener("touchmove", handlePointerMove);

        return () => {
            document.removeEventListener("mouseup", handlePointerUp);
            document.removeEventListener("touchend", handlePointerUp);
            document.removeEventListener("mousemove", handlePointerMove);
            document.removeEventListener("touchmove", handlePointerMove);
        };
    }, [handlePointerUp, handlePointerMove]);

    return (
        <div ref={containerRef} className={`relative w-full h-full flex items-center justify-center select-none overflow-hidden ${className}`}>
            {/* 
                ADAPTIVE LAYOUT STRATEGY:
                We make the Video the "reference" element (relative) so the container shrinks/grows to fit it.
                The Image overlay becomes absolute to match the video's exact frame.
                Max dimensions ensure it doesn't overflow the modal.
             */}

            {/* Background Layer: Generated Video (Defines Size) */}
            <video
                src={videoSrc}
                autoPlay
                loop
                muted
                playsInline
                className="relative max-w-full max-h-full object-contain pointer-events-none"
            />

            {/* Tag for Video */}
            <div className="absolute top-4 right-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold pointer-events-none z-10">
                Generated
            </div>

            {/* Foreground Layer: Original Image (Clipped, Absolute over Video) */}
            <div
                className="absolute inset-0 flex items-center justify-center overflow-hidden"
                style={{ clipPath: `inset(0 ${100 - sliderParams.position}% 0 0)` }}
            >
                {/* 
                   We match the video size exactly. 
                   Since 'inset-0' stretches to the container (which fits the video),
                   the image inside just needs to cover/contain same as video.
                */}
                <img
                    src={imageSrc}
                    alt="Original"
                    className="max-w-full max-h-full object-contain pointer-events-none"
                />
                <div className="absolute top-4 left-4 bg-black/50 text-white px-2 py-1 rounded text-xs font-bold pointer-events-none">
                    Original
                </div>
            </div>

            {/* Slider Handle */}
            <div
                className="absolute top-0 bottom-0 w-1 bg-white cursor-ew-resize z-20 flex items-center justify-center opacity-80 hover:opacity-100 transition-opacity"
                style={{ left: `${sliderParams.position}%` }}
                onMouseDown={handlePointerDown}
                onTouchStart={handlePointerDown}
            >
                <div className="w-8 h-8 rounded-full bg-white flex items-center justify-center shadow-lg -ml-0.5 pointer-events-none text-black">
                    <GripVertical className="size-4" />
                </div>
            </div>
        </div>
    );
}
