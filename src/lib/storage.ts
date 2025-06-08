
import { BrandGuide } from '@/types';

interface BrandGuideData {
  guide: BrandGuide;
  colorNames?: { [key: string]: string };
  typographyVisibility?: {
    display: string[];
    heading: string[];
    body: string[];
  };
  typographyNames?: { [key: string]: string };
  previewText?: string;
}

const STORAGE_KEY = 'brand-guide-data';
const WELCOME_SEEN_KEY = 'welcome-seen';

export const storage = {
  saveBrandGuide: (data: BrandGuideData) => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Failed to save brand guide to localStorage:', error);
    }
  },

  loadBrandGuide: (): BrandGuideData | null => {
    try {
      const data = localStorage.getItem(STORAGE_KEY);
      return data ? JSON.parse(data) : null;
    } catch (error) {
      console.error('Failed to load brand guide from localStorage:', error);
      return null;
    }
  },

  clearBrandGuide: () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch (error) {
      console.error('Failed to clear brand guide from localStorage:', error);
    }
  },

  hasSeenWelcome: (): boolean => {
    try {
      return localStorage.getItem(WELCOME_SEEN_KEY) === 'true';
    } catch (error) {
      console.error('Failed to check welcome status:', error);
      return false;
    }
  },

  markWelcomeSeen: () => {
    try {
      localStorage.setItem(WELCOME_SEEN_KEY, 'true');
    } catch (error) {
      console.error('Failed to mark welcome as seen:', error);
    }
  }
};
