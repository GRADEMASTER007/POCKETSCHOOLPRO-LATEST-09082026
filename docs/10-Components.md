# 10 - Component Reference Guide

## Primary UI Components Overview

### 1. Header & Navigation (`src/components/layout/Navbar.tsx`)
- Displays app title, Gold VIP badge, active curriculum flag indicator, user token balance indicator, and profile menu dropdown.

### 2. Collapsible Sidebar (`src/components/layout/Sidebar.tsx`)
- Provides navigation links across study tools, dashboards, classroom features, sponsorship portals, and user settings. Responsive drawer transformation on mobile viewports.

### 3. D3 Math Plotter Canvas (`src/components/study/whiteboard/D3MathPlotterCanvas.tsx`)
- **Props**: `initialExpression`, `title`, `height`, `showControls`.
- **Functionality**: Uses `d3MathPlotter.ts` to render dynamic coordinate systems, tangent derivative lines, definite integral regions, and real-time hover coordinate readouts.

### 4. KaTeX Math Renderer (`src/components/study/whiteboard/KaTeXMath.tsx`)
- **Props**: `math`, `block`, `inlineClassName`.
- **Functionality**: Safe LaTeX formula rendering using KaTeX CSS rules with fallback to raw math text on parse errors.

### 5. Yoco Payment Checkout Modal (`src/components/billing/YocoCheckoutModal.tsx`)
- **Props**: `planId`, `amountZar`, `planName`, `onSuccess`, `onClose`.
- **Functionality**: Mounts Yoco inline SDK modal to capture card payments and verify transaction status via `/api/checkout/yoco`.

### 6. Voice Synthesizer Button (`src/components/tools/VoiceSynthesizer.tsx`)
- **Props**: `text`, `language`.
- **Functionality**: Triggers `speak(text, language)` using multi-language Web Speech API voices.
