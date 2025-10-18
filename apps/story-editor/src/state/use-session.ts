import { create } from "zustand";

interface SimulationState {
  sessionData?: unknown;
  setSessionData: (data: unknown) => void;
  storyApiUrl: string;
  setStoryApiUrl: (url: string) => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
  lastResponse?: string;
  setLastResponse: (text?: string) => void;
}

function getDefaultApiUrl(): string {
  return (typeof window !== "undefined" && window.localStorage?.getItem("story-api-url"))
    || (typeof process !== "undefined" && process.env.STORY_API_URL)
    || "http://localhost:3000";
}

export const useSimulation = create<SimulationState>((set) => ({
  sessionData: undefined,
  setSessionData: (data) => set({ sessionData: data }),
  storyApiUrl: getDefaultApiUrl(),
  setStoryApiUrl: (url) => {
    try {
      window.localStorage?.setItem("story-api-url", url);
    } catch (error) {
      console.warn("Unable to persist story API URL", error);
    }
    set({ storyApiUrl: url });
  },
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  lastResponse: undefined,
  setLastResponse: (text) => set({ lastResponse: text }),
}));
