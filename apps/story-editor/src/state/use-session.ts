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

export const useSimulation = create<SimulationState>((set) => ({
  sessionData: undefined,
  setSessionData: (data) => set({ sessionData: data }),
  storyApiUrl: import.meta.env.VITE_STORY_API_URL ?? "http://localhost:3000",
  setStoryApiUrl: (url) => set({ storyApiUrl: url }),
  isLoading: false,
  setIsLoading: (isLoading) => set({ isLoading }),
  lastResponse: undefined,
  setLastResponse: (text) => set({ lastResponse: text }),
}));
