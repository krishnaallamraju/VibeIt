// Dribbble Modern Dark Music App Theme System (Identifying Songs Inspired)

export const theme = {
  colors: {
    background: '#06070B',       // Deep obsidian inky black
    backgroundAura: '#090B14',   // Midnight blue ambient aura
    cardBg: 'rgba(16, 20, 34, 0.72)', // Frosted dark glass
    cardBgSecondary: 'rgba(24, 29, 48, 0.55)',
    cardBgSolid: '#101422',
    border: 'rgba(255, 255, 255, 0.08)',
    borderActive: '#A855F7',     // Neon Purple / Violet
    
    // Glowing Dribbble Accents
    primary: '#A855F7',          // Electric Violet
    primaryGlow: '#C084FC',
    secondary: '#00E5FF',        // Electric Cyan
    blue: '#3B82F6',             // Azure Blue
    green: '#10B981',            // Emerald Mint
    pink: '#F43F5E',             // Rose Neon
    yellow: '#F59E0B',           // Amber Gold
    
    // Text
    textPrimary: '#FFFFFF',
    textSecondary: '#94A3B8',
    textMuted: '#64748B',
  },
  borderRadius: {
    sm: 10,
    md: 16,
    lg: 24,
    xl: 32,
    full: 9999,
  },
  shadows: {
    card: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 8,
    },
    glowOrb: {
      shadowColor: '#A855F7',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.65,
      shadowRadius: 30,
      elevation: 16,
    },
    glowCyan: {
      shadowColor: '#00E5FF',
      shadowOffset: { width: 0, height: 0 },
      shadowOpacity: 0.5,
      shadowRadius: 20,
      elevation: 10,
    },
  }
};
