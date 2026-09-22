// Dribbble Modern Dark Music App Theme System

export const theme = {
  colors: {
    background: '#0B0C10',       // Deep midnight obsidian
    cardBg: '#141622',           // Sleek dark glass card
    cardBgSecondary: '#1C1F30',  // Slightly lighter glass layer
    border: '#2A2E45',           // Subtle card border
    borderActive: '#7C3AED',     // Vibrant violet border highlight
    
    // Accents
    primary: '#7C3AED',          // Electric Violet / Purple
    primaryGlow: '#9333EA',
    secondary: '#00E5FF',        // Electric Cyan
    pink: '#FF2A75',             // Vivid Pink / Coral
    green: '#00E676',            // Neon Emerald
    yellow: '#FFC107',           // Gold
    
    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },
  borderRadius: {
    sm: 8,
    md: 14,
    lg: 20,
    xl: 28,
    full: 9999,
  },
  shadows: {
    card: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 6 },
      shadowOpacity: 0.25,
      shadowRadius: 12,
      elevation: 6,
    },
    glowGreen: {
      shadowColor: '#00E676',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.4,
      shadowRadius: 10,
      elevation: 8,
    },
    glowPrimary: {
      shadowColor: '#7C3AED',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.5,
      shadowRadius: 16,
      elevation: 10,
    }
  }
};
