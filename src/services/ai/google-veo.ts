/**
 * Google Veo Adapter Implementation
 */
import { VideoGenAdapter, VideoGenerationConfig, VideoGenerationResult, ProgressCallback } from "./types";

export class GoogleVeoAdapter implements VideoGenAdapter {
    id = "google-veo";
    name = "Google Veo (Vertex AI)";

    async generate(config: VideoGenerationConfig, onProgress?: ProgressCallback): Promise<VideoGenerationResult> {
        const apiKey = import.meta.env.VITE_GOOGLE_CLOUD_API_KEY;
        const projectId = import.meta.env.VITE_GOOGLE_CLOUD_PROJECT_ID;

        if (!apiKey || !projectId) {
            return {
                success: false,
                error: "❌ Missing API Config. Check .env.local"
            };
        }

        console.group("🚀 [GoogleVeoAdapter Request]");
        console.log("Config:", config);

        try {
            if (onProgress) onProgress(5);

            // 1. Prepare Instances & Ratio
            const instances: any[] = [{ prompt: config.prompt }];
            let targetRatio = "16:9"; // Default

            if (config.imageFile) {
                console.log("Processing Image:", config.imageFile.name);
                const base64Image = await fileToBase64(config.imageFile);

                instances[0].image = {
                    bytesBase64Encoded: base64Image,
                    mimeType: config.imageFile.type
                };

                try {
                    const dimensions = await getImageDimensions(config.imageFile);
                    targetRatio = getClosestAspectRatio(dimensions.width, dimensions.height);
                    console.log("Detected Aspect Ratio:", targetRatio);
                } catch (dimErr) {
                    console.warn("Could not detect image dimensions, defaulting to 16:9", dimErr);
                }

                // Force prompt to acknowledge image AND add System Prompt with EXPLICIT ratio
                const SYSTEM_PROMPT = `(System) Generate a high-quality video. IMPORTANT: The output video MUST have a ${targetRatio} aspect ratio to match the input image.`;
                instances[0].prompt = `${SYSTEM_PROMPT} Animate this image: ${config.prompt}`;
            }

            // 2. Prepare Payload
            const payload = {
                instances: instances,
                parameters: {
                    sampleCount: 1,
                    durationSeconds: 5,
                    personGeneration: "allow_adult",
                    aspectRatio: "16:9" // Default, overridden if image present
                }
            };

            // Use detected ratio if image present, OR if config manually specified it
            const finalRatio = targetRatio !== "16:9" ? targetRatio : (config.aspectRatio || "16:9");
            if (finalRatio !== "16:9") {
                // @ts-ignore
                payload.parameters.aspectRatio = finalRatio;
            }

            console.log("Payload Size:", JSON.stringify(payload).length);

            // 3. Start Long-Running Operation (LRO)
            const modelId = "veo-2.0-generate-001";
            const baseUrl = `/api/google/v1beta/models/${modelId}`;
            const startEndpoint = `${baseUrl}:predictLongRunning?key=${apiKey}`;

            if (onProgress) onProgress(10);
            console.log("POST", startEndpoint);

            let startResponse;
            try {
                startResponse = await fetch(startEndpoint, {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify(payload)
                });
            } catch (netErr: any) {
                console.error("Fetch Failed:", netErr);
                const isNetworkError = netErr.message === "Failed to fetch" || netErr.name === "TypeError";
                throw new Error(isNetworkError
                    ? "Network Error: Could not connect to API Proxy. Please check if the dev server is running and the proxy is configured in vite.config.ts."
                    : `Network Error: ${netErr.message}`);
            }

            if (!startResponse.ok) {
                const errorText = await startResponse.text();
                // console.error("❌ Start API Error:", startResponse.status, errorText);
                throw new Error(`Start Request Failed (${startResponse.status}): ${errorText}`);
            }

            const startData = await startResponse.json();
            console.log("✅ LRO Started:", startData);

            const operationName = startData.name;
            if (!operationName) {
                throw new Error("No Operation Name returned from API.");
            }

            // 4. Poll for Completion
            if (onProgress) onProgress(20);
            let done = false;
            let attempts = 0;
            let resultData = null;

            console.log("Polling Operation:", operationName);

            while (!done && attempts < 300) { // Max 10 minutes
                attempts++;
                await new Promise(r => setTimeout(r, 2000));

                if (onProgress) onProgress(Math.min(20 + (attempts / 3), 90));

                const pollUrl = `/api/google/v1beta/${operationName}?key=${apiKey}`;
                // console.log(`Polling ${attempts}:`, pollUrl);

                const pollResponse = await fetch(pollUrl, {
                    method: "GET",
                    headers: { "Content-Type": "application/json" }
                });

                if (!pollResponse.ok) {
                    if (pollResponse.status === 404) {
                        throw new Error("Operation not found (404). Check console.");
                    }
                    continue; // Retry transient errors
                }

                const pollData = await pollResponse.json();

                if (pollData.done) {
                    done = true;
                    if (pollData.error) {
                        throw new Error(`Generation Failed: ${JSON.stringify(pollData.error)}`);
                    }
                    resultData = pollData.response;
                }
            }

            if (!done) {
                throw new Error("Operation timed out after 10 minutes.");
            }

            // 5. Parse Result
            console.log("Parsing Result Data:", resultData);
            let videoUrl = "";

            // Check GenLang Format
            if (resultData?.generateVideoResponse?.generatedSamples?.[0]?.video?.uri) {
                videoUrl = resultData.generateVideoResponse.generatedSamples[0].video.uri;
                if (!videoUrl.includes("key=")) {
                    videoUrl += `&key=${apiKey}`;
                }
            }
            // Check Vertex Format
            else {
                const video = resultData?.videos?.[0];
                if (video?.gcsUri) {
                    videoUrl = video.gcsUri;
                } else if (video?.bytesBase64Encoded) {
                    videoUrl = `data:video/mp4;base64,${video.bytesBase64Encoded}`;
                } else {
                    console.error("Unknown Video Format:", resultData);
                    throw new Error("Video generated but format unrecognized (No Base64/GCS/URI).");
                }
            }

            if (onProgress) onProgress(100);
            console.groupEnd();

            return {
                success: true,
                videoUrl: videoUrl,
                metadata: {
                    duration: 5.0,
                    creditsDeducted: 50,
                    aspectRatio: finalRatio,
                    rawResponse: resultData
                }
            };

        } catch (error: any) {
            console.error("Adapter Error:", error);
            console.groupEnd();
            return {
                success: false,
                error: error.message || "Unknown error"
            };
        }
    }
}

// --- Helpers ---

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => {
            const result = reader.result as string;
            const base64 = result.split(",")[1];
            resolve(base64);
        };
        reader.onerror = error => reject(error);
    });
};

const getImageDimensions = (file: File): Promise<{ width: number; height: number }> => {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve({ width: img.width, height: img.height });
        img.onerror = reject;
        img.src = URL.createObjectURL(file);
    });
};

const getClosestAspectRatio = (width: number, height: number): string => {
    const targetRatio = width / height;
    const supportedRatios = [
        { label: "16:9", value: 16 / 9 },
        { label: "9:16", value: 9 / 16 }
    ];
    return supportedRatios.reduce((prev, curr) => {
        return (Math.abs(curr.value - targetRatio) < Math.abs(prev.value - targetRatio) ? curr : prev);
    }).label;
};
