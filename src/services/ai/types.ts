export interface VideoGenerationConfig {
    prompt: string;
    imageFile?: File | null; // Optional image input
    // Metadata for the model
    aspectRatio?: string; // e.g. "16:9", "9:16"
    durationSeconds?: number;
}

export interface VideoGenerationResult {
    success: boolean;
    videoUrl?: string; // Final URL (could be base64 or remote)
    error?: string;
    metadata?: {
        creditsDeducted: number;
        duration: number;
        aspectRatio: string;
        rawResponse?: any;
    };
}

export type ProgressCallback = (progress: number) => void;

export interface VideoGenAdapter {
    id: string; // "google-veo", "sora", "runway"
    name: string; // Display name
    generate(
        config: VideoGenerationConfig,
        onProgress?: ProgressCallback
    ): Promise<VideoGenerationResult>;
}
