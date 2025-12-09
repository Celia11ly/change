import { GoogleVeoAdapter } from "./google-veo";
import { VideoGenAdapter } from "./types";

// Factory to get the active adapter
// In the future, this could switch based on user subscription or settings
export const AIServiceFactory = {
    getAdapter: (): VideoGenAdapter => {
        return new GoogleVeoAdapter();
    }
};

export * from "./types";
