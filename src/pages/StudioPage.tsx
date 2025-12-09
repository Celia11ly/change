import { useState } from "react";
import { useApp } from "@/context/AppContext";
import { supabase } from "@/lib/supabase";
import { Trash2, Wand2 } from "lucide-react";
import { Template } from "@/constants/templates";
import { TemplateCard } from "@/components/TemplateCard";
import { TemplatePreviewModal } from "@/components/TemplatePreviewModal";
import { AIServiceFactory } from "@/services/ai";

import { AlertDialog } from "@/components/ui/AlertDialog";

export default function StudioPage() {
    const [templateToDelete, setTemplateToDelete] = useState<string | null>(null);
    const { myTemplates, addCustomTemplate, deleteCustomTemplate, credits, deductCredits } = useApp();
    const [prompt, setPrompt] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [isTraining, setIsTraining] = useState(false);
    const [progress, setProgress] = useState(0);
    const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);

    const [error, setError] = useState<string | null>(null);

    const handleTrain = async () => {
        if (!prompt.trim()) return;

        // 1. Credit Check
        const COST_PER_VIDEO = 50;
        if (credits < COST_PER_VIDEO) {
            setError(`Insufficient credits. You need ${COST_PER_VIDEO} credits to generate a video.`);
            return;
        }

        setIsTraining(true);
        // ... (rest of code)

        try {
            console.log("Calling AI Service...");
            const adapter = AIServiceFactory.getAdapter();

            const result = await adapter.generate({
                prompt: prompt,
                imageFile: imageFile || undefined
            }, (p) => setProgress(p));

            console.log("AI Result:", result);

            if (result.success && result.videoUrl) {
                // Deduct Credits
                const creditResult = await deductCredits(result.metadata?.creditsDeducted || COST_PER_VIDEO);
                if (!creditResult.success) {
                    alert(`⚠️ Credit Deduction Failed: ${creditResult.error}\n(But your video was generated)`);
                }

                // ... (Upload and Create Template logic) 
                // 1. Upload Image to Supabase Storage (if exists) to get persistent URL
                let persistentImageUrl = "https://placehold.co/600x400/purple/white?text=Video";

                if (imageFile) {
                    // SANITIZE FILENAME
                    const safeName = imageFile.name.replace(/[^a-zA-Z0-9.-]/g, '_');
                    const fileName = `${Date.now()}_${safeName}`;

                    const { data: _uploadData, error: uploadError } = await supabase.storage
                        .from('uploads')
                        .upload(fileName, imageFile);

                    if (uploadError) {
                        alert(`❌ Upload Error: ${uploadError.message}\nRun fix_all_permissions.sql!`);
                        persistentImageUrl = URL.createObjectURL(imageFile); // Fallback
                    } else {
                        const { data: publicUrlData } = supabase.storage
                            .from('uploads')
                            .getPublicUrl(fileName);

                        persistentImageUrl = publicUrlData.publicUrl;
                        console.log("Persistent URL:", persistentImageUrl);
                    }
                }

                // 2. Create Template with Correct Metadata
                const newTemplate: Template = {
                    id: `custom-${Date.now()}`,
                    title: prompt.slice(0, 20) + "...",
                    thumbnailUrl: persistentImageUrl,
                    coverUrl: persistentImageUrl,
                    videoUrl: result.videoUrl,
                    fullPrompt: prompt,
                    description: `Generated with ${adapter.name}: ${prompt.slice(0, 30)}...`,
                    rating: 5,
                    likes: 0,
                    isPremium: true,
                    category: "Custom",
                    // Use the DETECTED ratio from service, or fall back to 16:9
                    ratio: result.metadata?.aspectRatio || "16:9"
                };

                // 3. Save to DB
                addCustomTemplate(newTemplate);

                setPrompt("");
                setImageFile(null);
                // Success feedback (optional toast)
            } else {
                console.log("Setting Error:", result.error);
                setError(result.error || "Unknown Error");
            }
        } catch (e: any) {
            console.error("Catch Error:", e);
            setError(e.message);
        } finally {
            setIsTraining(false);
            setProgress(0);
        }
    };

    return (
        <div className="space-y-8">
            <div>
                <h1 className="text-3xl font-bold tracking-tight">Creation Studio</h1>
                <p className="text-muted-foreground mt-2">
                    Create videos using Google Veo AI. Enter a prompt and optionally upload an image.
                </p>
            </div>

            {/* Training / Creation Section */}
            <div className="p-6 bg-card border rounded-xl shadow-sm">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Wand2 className="size-5 text-primary" />
                    Generate New Video
                </h2>
                <div className="flex flex-col gap-4">
                    {/* Image Upload */}
                    <div>
                        <label className="block text-sm font-medium mb-1">Source Image (Optional for Image-to-Video)</label>
                        <input
                            type="file"
                            accept="image/*"
                            onChange={(e) => setImageFile(e.target.files?.[0] || null)}
                            className="block w-full text-sm text-slate-500
                                file:mr-4 file:py-2 file:px-4
                                file:rounded-full file:border-0
                                file:text-sm file:font-semibold
                                file:bg-primary file:text-primary-foreground
                                hover:file:bg-primary/90"
                        />
                        {imageFile && <p className="text-xs text-green-600 mt-1">Selected: {imageFile.name}</p>}
                    </div>

                    <div className="flex gap-4 flex-col md:flex-row">
                        <textarea
                            value={prompt}
                            onChange={(e) => {
                                setPrompt(e.target.value);
                                // Auto-resize height
                                e.target.style.height = 'auto';
                                e.target.style.height = e.target.scrollHeight + 'px';
                            }}
                            placeholder="Describe the video you want (e.g., 'Cyberpunk city with neon lights')"
                            className="flex-1 min-h-[80px] max-h-[200px] py-3 rounded-lg border border-input bg-background px-4 outline-none focus:ring-2 focus:ring-primary resize-none overflow-y-auto"
                            rows={3}
                        />
                        <button
                            disabled={isTraining || !prompt.trim()}
                            onClick={handleTrain}
                            className="h-auto px-8 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 justify-center min-w-[140px]"
                        >
                            {isTraining ? `Generating ${Math.round(progress)}%` : "Generate"}
                        </button>
                    </div>
                    {isTraining && (
                        <p className="text-center text-sm text-amber-600 animate-pulse font-medium">
                            正在生成，请不要关闭弹窗
                        </p>
                    )}
                </div>
            </div>

            {/* Error Console */}
            {error && (
                <div className="p-4 rounded-lg border border-red-200 bg-red-50 text-red-900 text-sm overflow-auto max-h-60">
                    <h3 className="font-bold flex items-center gap-2 mb-2">
                        <span className="text-xl">⚠️</span> API Error
                    </h3>
                    <pre className="whitespace-pre-wrap font-mono text-xs">{error}</pre>
                </div>
            )}

            {/* My Templates List */}
            <div>
                <h2 className="text-xl font-bold mb-4">My Creations</h2>

                {myTemplates.length === 0 ? (
                    <div className="text-center py-20 border-2 border-dashed rounded-xl bg-muted/30">
                        <p className="text-muted-foreground">You haven't generated any videos yet.</p>
                    </div>
                ) : (
                    // Masonry Layout for Waterfall Effect
                    <div className="columns-2 md:columns-3 lg:columns-4 gap-6 space-y-6">
                        {myTemplates.map((template) => (
                            <div key={template.id} className="relative group break-inside-avoid">
                                <TemplateCard
                                    template={template}
                                    onPreview={setSelectedTemplate}
                                    onClick={() => setSelectedTemplate(template)}
                                />
                                <button
                                    onClick={(e) => {
                                        e.stopPropagation(); // Prevent card click
                                        setTemplateToDelete(template.id);
                                    }}
                                    className="absolute top-2 right-12 z-30 p-1.5 bg-red-500/80 text-white rounded-md opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 backdrop-blur-sm"
                                    title="Delete Template"
                                >
                                    <Trash2 className="size-4" />
                                </button>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <TemplatePreviewModal
                template={selectedTemplate}
                isOpen={!!selectedTemplate}
                onClose={() => setSelectedTemplate(null)}
            />
            {/* UI: Delete Confirmation Dialog */}
            <AlertDialog
                isOpen={!!templateToDelete}
                title="Delete Template"
                description="Are you sure you want to delete this creation? This action cannot be undone."
                confirmLabel="Delete"
                cancelLabel="Cancel"
                variant="danger"
                onCancel={() => setTemplateToDelete(null)}
                onConfirm={() => {
                    if (templateToDelete) {
                        deleteCustomTemplate(templateToDelete);
                        setTemplateToDelete(null);
                    }
                }}
            />
        </div >
    );
}
