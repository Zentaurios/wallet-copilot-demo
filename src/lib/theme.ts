import type { Theme } from "thirdweb/react";

/**
 * thirdweb Connect Button theme configuration
 * Enhanced with depth, shadows, and premium styling
 */
export const thirdwebTheme: Theme = {
  type: "dark",
  fontFamily: "var(--font-geist-sans), system-ui, sans-serif",
  colors: {
    // Primary action buttons (Connect Wallet, etc) - Enhanced gradient
    primaryButtonBg: "#CF1F8D",
    primaryButtonText: "#ffffff",
    
    // Accent elements (links, highlights)
    accentButtonBg: "#7000FF",
    accentButtonText: "#ffffff",
    accentText: "#CF1F8D",
    
    // Connected wallet button - Glass effect
    connectedButtonBg: "rgba(255, 255, 255, 0.08)",
    connectedButtonBgHover: "rgba(255, 255, 255, 0.12)",
    
    // Secondary actions - Subtle with border
    secondaryButtonBg: "rgba(255, 255, 255, 0.05)",
    secondaryButtonHoverBg: "rgba(255, 255, 255, 0.08)",
    secondaryButtonText: "#ffffff",
    
    // Icons
    secondaryIconColor: "rgba(255, 255, 255, 0.6)",
    secondaryIconHoverColor: "#ffffff",
    secondaryIconHoverBg: "rgba(255, 255, 255, 0.08)",
    
    // Modal & overlays - Deeper background
    modalBg: "#1a1a1a",
    modalOverlayBg: "rgba(0, 0, 0, 0.75)",
    
    // Text
    primaryText: "#ffffff",
    secondaryText: "rgba(255, 255, 255, 0.6)",
    
    // Borders & separators - More visible
    borderColor: "rgba(255, 255, 255, 0.12)",
    separatorLine: "rgba(255, 255, 255, 0.1)",
    
    // Backgrounds
    tertiaryBg: "rgba(255, 255, 255, 0.04)",
    
    // Input fields
    inputAutofillBg: "rgba(255, 255, 255, 0.05)",
    
    // Selection
    selectedTextBg: "rgba(207, 31, 141, 0.2)",
    selectedTextColor: "#CF1F8D",
    
    // Loading states
    skeletonBg: "rgba(255, 255, 255, 0.08)",
    scrollbarBg: "rgba(255, 255, 255, 0.1)",
    
    // Status colors
    success: "#00D395",
    danger: "#E74C3C",
    
    // Tooltips
    tooltipBg: "#2a2a2a",
    tooltipText: "#ffffff",
  },
};
