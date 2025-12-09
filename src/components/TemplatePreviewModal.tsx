import { X, Upload, Bookmark, Download, Share2, RefreshCw } from "lucide-react";
import { Template } from "@/constants/templates";
import { useEffect, useState, useRef } from "react";
import { useApp } from "@/context/AppContext";
import { ComparisonSlider } from "./ComparisonSlider";
import { ShareOptions } from "./ShareOptions";
import { AIServiceFactory } from "@/services/ai";

interface PreviewModalProps {
    template: Template | null;
    isOpen: boolean;
    onClose: () => void;
}

export function TemplatePreviewModal({ template, isOpen, onClose }: PreviewModalProps) {
    const { deductCredits, toggleSaveTemplate, isSaved } = useApp();

    // State: 'preview' | 'generating' | 'result'
    const [viewState, setViewState] = useState<'preview' | 'generating' | 'result'>('preview');

    const [isUploading, setIsUploading] = useState(false);
    const [isSharing, setIsSharing] = useState(false); // New State
    const [uploadProgress, setUploadProgress] = useState(0);
    const [uploadedFile, setUploadedFile] = useState<string | null>(null);
    const [generatedVideoUrl, setGeneratedVideoUrl] = useState<string | null>(null);
    const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null); // To store valid image URL for slider
    const [errorMsg, setErrorMsg] = useState<string | null>(null);

    const videoRef = useRef<HTMLVideoElement>(null);

    const [uploadedFileObj, setUploadedFileObj] = useState<File | null>(null); // Store actual file

    useEffect(() => {
        if (isOpen && template) {
            document.body.style.overflow = "hidden";

            // Check if Custom Template -> Go straight to "Result/Comparison" view
            // Assuming for Custom templates: coverUrl = Original Image, videoUrl = Generated Video
            if (template.category === 'Custom') {
                setViewState('result');
                setGeneratedVideoUrl(template.videoUrl);
                setUploadedImagePreview(template.coverUrl); // In StudioPage, coverUrl is set to the uploaded image blob
                setUploadedFile(null);
                setUploadedFileObj(null);
                setErrorMsg(null);
            } else {
                // Official Template -> Start in Preview mode
                setViewState('preview');
                setUploadedFile(null);
                setUploadedFileObj(null);
                setUploadedImagePreview(null);
                setUploadProgress(0);
                setGeneratedVideoUrl(null);
                setErrorMsg(null);
            }
        } else {
            document.body.style.overflow = "unset";
            if (videoRef.current) {
                videoRef.current.pause();
            }
        }
    }, [isOpen]);

    if (!isOpen || !template) return null;

    const cost = template.isPremium ? 50 : 30;
    const saved = isSaved(template.id);

    const handleUploadClick = () => {
        const fileInput = document.getElementById('hidden-file-input') as HTMLInputElement;
        fileInput?.click();
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                alert("File size too large! Max 5MB.");
                return;
            }
            setIsUploading(true);
            setUploadProgress(0);

            // Create object URL for preview
            const objectUrl = URL.createObjectURL(file);
            setUploadedImagePreview(objectUrl);
            setUploadedFileObj(file); // Store file object

            const interval = setInterval(() => {
                setUploadProgress((prev) => {
                    if (prev >= 100) {
                        clearInterval(interval);
                        setIsUploading(false);
                        setUploadedFile(file.name);
                        return 100;
                    }
                    return prev + 20;
                });
            }, 50);
        }
    };

    const handleGenerate = async () => {
        if (!uploadedFileObj) {
            setErrorMsg("Please upload an image first!");
            return;
        }

        const deduction = await deductCredits(cost);
        if (deduction.success) {
            setViewState('generating');
            setErrorMsg(null);

            try {
                // REAL API CALL
                const adapter = AIServiceFactory.getAdapter();
                const result = await adapter.generate({
                    prompt: template.fullPrompt || template.title,
                    imageFile: uploadedFileObj
                }, (p) => {
                    setUploadProgress(p);
                });

                if (result.success && result.videoUrl) {
                    setGeneratedVideoUrl(result.videoUrl);
                    setViewState('result');
                } else {
                    setViewState('preview'); // Reset on failure so they can try again
                    setErrorMsg(result.error || "Generation failed");
                }
            } catch (e: any) {
                setViewState('preview');
                setErrorMsg(e.message || "Unknown error occurred");
            }

        } else {
            setErrorMsg("Insufficient credits! Please top up.");
        }
    };

    const isGenerating = viewState === 'generating';
    const isResult = viewState === 'result';

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-0 md:p-4 sm:p-6 bg-black/80 backdrop-blur-sm">
            {/* Backdrop Click to Close */}
            <div
                className="absolute inset-0"
                onClick={onClose}
            />

            <div className={`relative w-full max-w-5xl bg-card border shadow-2xl rounded-none md:rounded-2xl overflow-hidden flex flex-col md:flex-row h-full md:h-auto md:max-h-[90vh] transition-all duration-300`}>
                {/* Close Button Mobile: Top Right floating */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-50 p-2 rounded-full bg-black/40 text-white hover:bg-black/60 transition-colors md:hidden"
                >
                    <X className="size-6" />
                </button>

                {/* Left: Video Preview or Result (Adaptive Height) */}
                <div className="w-full md:w-2/3 bg-black relative flex items-center justify-center flex-1 min-h-[300px] max-h-[80vh]">
                    {isResult && generatedVideoUrl && uploadedImagePreview ? (
                        // RESULT VIEW WITH SLIDER
                        <ComparisonSlider
                            imageSrc={uploadedImagePreview}
                            videoSrc={generatedVideoUrl}
                            className="w-full h-full"
                        />
                    ) : (
                        // PREVIEW VIEW
                        <>
                            <video
                                ref={videoRef}
                                src={template.videoUrl}
                                poster={template.coverUrl}
                                controls
                                muted={false}
                                playsInline
                                className="w-full h-full object-contain"
                            />
                            {/* Overlay Title (Hidden in Result) */}
                            {!isResult && (
                                <div className="absolute bottom-4 left-4 bg-black/50 px-3 py-1 rounded text-white text-sm backdrop-blur-sm pointer-events-none">
                                    Previewing: {template.title}
                                </div>
                            )}
                        </>
                    )}
                </div>

                {/* Right: Actions (Bottom half on mobile) */}
                <div className="w-full md:w-1/3 p-4 md:p-6 flex flex-col bg-card overflow-y-auto h-full flex-1">
                    {/* Close Button Desktop */}
                    <button
                        onClick={onClose}
                        className="self-end p-2 rounded-full hover:bg-muted hidden md:flex mb-2"
                    >
                        <X className="size-5" />
                    </button>

                    {isResult ? (
                        // RESULT ACTIONS
                        <div className="flex flex-col h-full animate-in fade-in slide-in-from-right-4 duration-300">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold mb-2">Video Ready!</h2>
                                <p className="text-muted-foreground">Slide to compare your verified image with the generated video.</p>
                            </div>

                            <div className="space-y-3 mt-auto">
                                <button
                                    onClick={() => {
                                        if (generatedVideoUrl) {
                                            const a = document.createElement('a');
                                            a.href = generatedVideoUrl;
                                            a.download = `veo-generated-${Date.now()}.mp4`;
                                            document.body.appendChild(a);
                                            a.click();
                                            document.body.removeChild(a);
                                        }
                                    }}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90"
                                >
                                    <Download className="size-5" />
                                    Download Video
                                </button>
                                {isSharing ? (
                                    <div className="p-3 bg-muted/30 rounded-lg animate-in fade-in slide-in-from-bottom-2">
                                        <div className="flex items-center justify-between mb-2">
                                            <span className="text-sm font-bold">Share to:</span>
                                            <button onClick={() => setIsSharing(false)} className="text-xs text-muted-foreground hover:text-foreground">Cancel</button>
                                        </div>
                                        <ShareOptions
                                            url={generatedVideoUrl || ""}
                                            title={`Check out this video I generated with VidGenius: ${template.title}`}
                                        />
                                    </div>
                                ) : (
                                    <button
                                        onClick={() => setIsSharing(true)}
                                        className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border hover:bg-muted"
                                    >
                                        <Share2 className="size-5" />
                                        Share
                                    </button>
                                )}
                                <button
                                    onClick={() => setViewState('preview')}
                                    className="w-full flex items-center justify-center gap-2 py-3 rounded-lg text-muted-foreground hover:text-foreground text-sm"
                                >
                                    <RefreshCw className="size-4" />
                                    Generate Another
                                </button>
                            </div>
                        </div>
                    ) : (
                        // PREVIEW/GENERATE ACTIONS
                        <div className="flex flex-col h-full">
                            <div className="mb-6">
                                <h2 className="text-2xl font-bold mb-2">{template.title}</h2>
                                <div className="flex items-center gap-2 text-sm text-muted-foreground mb-4">
                                    <span className="bg-primary/10 text-primary px-2 py-0.5 rounded">Video Template</span>
                                    <span>•</span>
                                    <span className="flex items-center gap-1 text-yellow-400">
                                        ★ {template.rating}
                                    </span>
                                    <button onClick={() => toggleSaveTemplate(template.id)} className={`ml-auto ${saved ? "text-primary fill-primary" : "text-muted-foreground"}`}>
                                        <Bookmark className={`size-5 ${saved ? "fill-current" : ""}`} />
                                    </button>
                                </div>
                                <p className="text-sm text-muted-foreground line-clamp-4 md:line-clamp-none">
                                    {template.description}
                                </p>
                            </div>

                            <div className="mt-auto space-y-4">
                                {/* Error Message Display */}
                                {errorMsg && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg text-red-200 text-sm">
                                        <strong>Error:</strong> {errorMsg}
                                    </div>
                                )}
                                <input
                                    type="file"
                                    id="hidden-file-input"
                                    className="hidden"
                                    accept="image/png, image/jpeg"
                                    onChange={handleFileChange}
                                />

                                <button
                                    onClick={handleUploadClick}
                                    disabled={isGenerating || !!uploadedFile}
                                    className={`w-full p-4 border border-dashed rounded-lg transition-colors text-center ${uploadedFile ? "bg-green-500/10 border-green-500/50" : "bg-muted/50 hover:bg-muted cursor-pointer"}`}
                                >
                                    {isUploading ? (
                                        <div className="space-y-2">
                                            <p className="text-sm font-medium">Uploading... {uploadProgress}%</p>
                                            <div className="h-2 w-full bg-secondary rounded-full overflow-hidden">
                                                <div className="h-full bg-primary transition-all duration-300" style={{ width: `${uploadProgress}%` }} />
                                            </div>
                                        </div>
                                    ) : uploadedFile ? (
                                        <div className="flex flex-col items-center text-green-500">
                                            <Upload className="size-8 mb-2" />
                                            <p className="text-sm font-bold">Image Uploaded!</p>

                                            {/* Small Preview Thumb */}
                                            {uploadedImagePreview && (
                                                <img src={uploadedImagePreview} alt="Preview" className="w-16 h-16 object-cover rounded mt-2 border" />
                                            )}
                                        </div>
                                    ) : (
                                        <>
                                            <Upload className="size-8 mx-auto text-muted-foreground mb-2" />
                                            <p className="text-sm font-medium">Upload your photo</p>
                                            <p className="text-xs text-muted-foreground">JPG, PNG up to 5MB</p>
                                        </>
                                    )}
                                </button>

                                <button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="w-full py-3 rounded-lg bg-primary text-primary-foreground font-bold hover:bg-primary/90 transition-all shadow-lg shadow-primary/20 disabled:opacity-50 flex items-center justify-center gap-2"
                                >
                                    {isGenerating ? (
                                        <>
                                            <RefreshCw className="size-5 animate-spin" />
                                            Generating Video...
                                        </>
                                    ) : `Generate Video (${cost} Credits)`}
                                </button>
                                {isGenerating && (
                                    <p className="text-center text-xs text-amber-500 animate-pulse font-medium">
                                        正在生成，请不要关闭弹窗
                                    </p>
                                )}
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
