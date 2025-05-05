
/**
 * Storage utility for persisting user preferences
 */

// Keys for local storage
const KEYS = {
  WELCOME_SEEN: 'brand-studio-welcome-seen',
  TOOLTIPS_SEEN: 'brand-studio-tooltips-seen',
};

export const storage = {
  /**
   * Check if user has seen the welcome message
   */
  hasSeenWelcome: (): boolean => {
    return localStorage.getItem(KEYS.WELCOME_SEEN) === 'true';
  },
  
  /**
   * Mark welcome message as seen
   */
  markWelcomeSeen: (): void => {
    localStorage.setItem(KEYS.WELCOME_SEEN, 'true');
  },
  
  /**
   * Check if user has completed the tooltips tour
   */
  hasSeenTooltips: (): boolean => {
    return localStorage.getItem(KEYS.TOOLTIPS_SEEN) === 'true';
  },
  
  /**
   * Mark tooltips as seen
   */
  markTooltipsSeen: (): void => {
    localStorage.setItem(KEYS.TOOLTIPS_SEEN, 'true');
  },

  /**
   * Reset all storage (for testing)
   */
  resetAll: (): void => {
    localStorage.removeItem(KEYS.WELCOME_SEEN);
    localStorage.removeItem(KEYS.TOOLTIPS_SEEN);
  }
};
