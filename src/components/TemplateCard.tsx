import { Play, Heart, Star } from "lucide-react";
import { useState } from "react";
import { Template } from "@/constants/templates";
import { useApp } from "@/context/AppContext";

interface TemplateCardProps {
    template: Template;
    onPreview: (template: Template) => void;
    onClick: () => void;
    showCategoryLabel?: boolean; // New Prop
    overrideLabel?: string;      // New Prop for force custom label text
}

export function TemplateCard({ template, onClick, showCategoryLabel = false, overrideLabel }: TemplateCardProps) {
    const { isSaved, toggleSaveTemplate } = useApp();
    const saved = isSaved(template.id);
    const categoryLabel = overrideLabel || template.category || (template.isPremium ? "Official" : "Custom");

    const [imgError, setImgError] = useState(false);
    const [thumbError, setThumbError] = useState(false);

    return (
        <div
            onClick={onClick}
            className="group relative cursor-pointer overflow-hidden rounded-xl bg-card border transition-all hover:scale-[1.02] hover:shadow-xl dark:hover:shadow-primary/20 break-inside-avoid mb-4"
        >
            <div className="relative w-full overflow-hidden">
                <img
                    src={imgError ? `https://placehold.co/600x400/222/FFF?text=${encodeURIComponent(template.title)}` : template.coverUrl}
                    alt={template.title}
                    onError={() => setImgError(true)}
                    className="w-full h-auto object-cover transition-transform duration-500 group-hover:scale-110"
                />

                {/* Play Overlay */}
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-black/20 opacity-0 transition-opacity group-hover:opacity-100 backdrop-blur-[2px]">
                    <div className="rounded-full bg-white/20 p-3 backdrop-blur-md">
                        <Play className="size-6 fill-white text-white" />
                    </div>
                </div>

                {/* Top Badges */}
                <div className="absolute left-2 top-2 z-20 flex gap-2">
                    <div className="h-8 w-8 overflow-hidden rounded-lg border-2 border-background shadow-lg bg-muted">
                        {(!thumbError && template.thumbnailUrl) ? (
                            <img
                                src={template.thumbnailUrl}
                                alt="Original"
                                className="h-full w-full object-cover"
                                onError={() => setThumbError(true)}
                            />
                        ) : (
                            <div className="h-full w-full flex items-center justify-center bg-red-100 dark:bg-red-900/30">
                                <span className="text-[8px] opacity-70 text-red-500">FAILED</span>
                            </div>
                        )}
                    </div>
                    {/* Category Label (Optional) or Visual Badge */}
                    {/* Category Label (Optional) or Visual Badge */}
                    {showCategoryLabel ? (
                        <div className={`rounded-md px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase text-white backdrop-blur-sm shadow-sm flex items-center justify-center ${categoryLabel === 'Custom' || categoryLabel === 'CUSTOM' ? 'bg-indigo-500/90' : 'bg-blue-500/90'}`}>
                            {categoryLabel}
                        </div>
                    ) : (
                        (template.category === 'Custom') ? (
                            <div className="rounded-md px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase text-white bg-indigo-500/90 backdrop-blur-sm shadow-sm flex items-center justify-center">
                                CUSTOM
                            </div>
                        ) : (template.badge || template.isPremium) ? (
                            <div className={`rounded-md px-2 py-0.5 text-[9px] font-bold tracking-wider uppercase backdrop-blur-sm shadow-sm flex items-center justify-center
                                ${template.badge === 'New' ? 'bg-emerald-400/90 text-black' :
                                    template.badge === 'Hot' ? 'bg-orange-500/90 text-white' :
                                        'bg-yellow-400/90 text-black'} 
                            `}>
                                {template.badge || "PRO"}
                            </div>
                        ) : null
                    )}
                </div>

                {/* Favorite Button */}
                <button
                    onClick={(e) => {
                        e.stopPropagation();
                        toggleSaveTemplate(template.id);
                    }}
                    className="absolute right-2 top-2 z-20 rounded-full bg-black/40 p-1.5 text-white backdrop-blur-sm transition-transform hover:scale-110 hover:bg-black/60"
                >
                    <Heart className={`size-4 ${saved ? "fill-red-500 text-red-500" : "text-white"}`} />
                </button>
            </div>

            <div className="p-4">
                <div className="mb-2 flex items-start justify-between">
                    <h3 className="font-bold line-clamp-1">{template.title}</h3>
                    <div className="flex items-center gap-1 text-xs font-bold text-yellow-400 bg-yellow-400/10 px-1.5 py-0.5 rounded">
                        <Star className="size-3 fill-yellow-400" />
                        <span>{template.rating}</span>
                    </div>
                </div>
                <p className="text-xs text-muted-foreground line-clamp-2">
                    {template.description}
                </p>
            </div>
        </div>
    );
}
