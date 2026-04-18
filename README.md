# NaviStadium — AI-Powered Stadium Experience Assistant

## Chosen Vertical

**Sporting Venue Experience** — helping fans navigate large-scale stadiums with real-time AI guidance, crowd-aware routing, and live wait time intelligence.

## Approach and Logic

The core of NaviStadium is a **conversational AI assistant powered by Google Gemini** that receives live stadium context — current wait times per gate/zone, crowd density levels, and the user's exact seat location — injected into every system prompt. This approach allows the assistant to deliver decisions grounded in real-world, real-time data rather than generic advice.

The architecture follows a strict separation of concerns:

| Layer | Responsibility | Key Files |
|-------|---------------|-----------|
| **AI Reasoning** | Google Gemini API processes fan queries with full venue context | `services/gemini.js`, `hooks/useAssistant.js` |
| **Live Data** | Simulated real-time streaming (30s polling) of wait times and crowd density per zone | `services/db.js`, `hooks/useWaitTimes.js` |
| **Spatial Interface** | Google Maps JS API renders a heatmap overlay with color-coded zone markers | `pages/MapPage.jsx` |
| **Auth & Identity** | Google Identity Services for secure sign-in with session persistence | `hooks/useAuth.js` |
| **Crowd Reports** | Fan-submitted reports flow back into the AI's context window | `hooks/useCrowdReports.js` |

## How the Solution Works

1. **Sign in** — User authenticates via Google Identity Services and enters their seat number (e.g. "Sect 104, Row B, Seat 12").
2. **Live data streams** — The system simulates real-time wait times and crowd density per zone, refreshing every 30 seconds. In production, this connects to IoT sensors or venue APIs via Google Sheets API.
3. **Interactive map** — Google Maps JS API renders a satellite view of the stadium with color-coded zone markers (🟢 < 5min, 🟡 5–10min, 🔴 > 10min) providing at-a-glance crowd intelligence.
4. **AI chat** — Fans ask natural language questions. Each query is sent to **Google Gemini** with a dynamically-built system prompt containing live wait times, crowd density, fan seat location, and recent crowd reports.
5. **Contextual answers** — Gemini returns actionable guidance: *"Gate B has a 4-minute wait — fastest from your seat 34B in the south stand. Concession 3 near Gate B shows low crowd density right now."*
6. **Crowd reports** — Fans can type `/report Very crowded at Gate D` to submit observations. These reports are stored and fed back into the AI's context as live signal.

## Assumptions Made

- Wait time and crowd density data is simulated with realistic randomized fluctuation. Production deployment would connect IoT sensors or venue APIs.
- Mobile-first responsive design — fans primarily use phones at live events.
- A single stadium layout is pre-loaded (AT&T Stadium). Multi-venue support is architecturally ready but scoped to one venue.
- Google Maps renders a satellite view; full venue geometry requires a venue-specific overlay.

## Tech Stack

| Technology | Purpose |
|-----------|---------|
| React 18 + Vite | UI framework + build tooling |
| Google Gemini API (`gemini-1.5-flash`) | AI reasoning layer |
| Google Maps JavaScript API | Venue map + heatmap visualization |
| Google Identity Services | Secure authentication |
| DOMPurify | XSS sanitization on all user input |
| Vitest + React Testing Library | Automated test suite |
| vite-plugin-pwa | Offline support via service worker |

## Setup

```bash
git clone https://github.com/puneet2409/PromptWars.git
cd PromptWars
npm install
cp .env.example .env   # fill in your API keys
npm run dev             # starts dev server at localhost:5173
npm run test            # runs all unit tests
npm run build           # production build to dist/
```

## Project Structure

```
src/
  components/   # Stateless UI components (WaitTimeCard, ChatMessage, SkeletonLoader)
  hooks/        # React hooks (useWaitTimes, useAuth, useAssistant, useCrowdReports)
  services/     # External service adapters (gemini.js, db.js)
  constants/    # App constants (ZONES, WAIT_THRESHOLDS, CROWD_LEVELS, SYSTEM_PROMPTS)
  utils/        # Pure utility functions (buildSystemPrompt, sanitize, formatWaitTime)
  pages/        # Page-level components (ChatPage, MapPage, ProfilePage)
  tests/        # Vitest test suites
```

## Google Services Integration

- **Google Gemini API** — Core AI brain. Every fan query receives a system prompt with live venue data.
- **Google Maps JS API** — Interactive satellite map with dynamic marker overlays.
- **Google Identity Services** — OAuth 2.0 sign-in with JWT credential decoding.
- **Google Fonts (Inter)** — Typography via CDN.
