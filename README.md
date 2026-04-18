# NaviStadium — AI-Powered Stadium Experience Assistant

## Chosen Vertical
Sporting Venue Experience — helping fans navigate large-scale stadiums with real-time AI guidance, crowd-aware routing, and live wait time intelligence.

## Approach and Logic
Explain that the core of the solution is a conversational AI assistant (Google Gemini) that receives live stadium context — current wait times per gate/zone, crowd density, the user's seat location — injected into every system prompt. This allows the assistant to give decisions grounded in real-world, real-time data rather than generic advice. Google Sheets/APIs powers the live data layer; Google Maps provides the spatial interface; Gemini provides the reasoning layer.

## How the Solution Works
Describe the full user journey:
1. User signs in via Google Auth and enters their seat number.
2. Simulated backend streams live wait times and crowd density per zone every 30 seconds.
3. The interactive Google Maps embed shows a crowd heatmap overlay with color-coded gate/concession/restroom markers.
4. The AI chat interface lets fans ask natural language questions. Each query is sent to Gemini API with a system prompt containing live venue context (wait times, density, user seat).
5. Gemini returns a contextual, actionable answer (e.g. 'Gate B has a 4-minute wait — fastest from your seat 34B in the south stand. Concession stand 3 near Gate B shows low crowd density right now.').
6. Fans can also submit crowd reports ('Very crowded at Gate D') stored in our reporting DB and fed back to the assistant as live signal.

## Assumptions Made
— Wait time and crowd density data is simulated via memory arrays mimicking a Google Sheet with realistic randomized fluctuation.
— The solution targets mobile-first usage since fans primarily use phones at events.
— A single stadium layout is pre-loaded; multi-venue support is architected but scoped to one venue for this submission.
— Google Maps venue geometry uses a representative large stadium as a placeholder.

## Tech Stack
- React 18 + Vite
- Google Gemini API (gemini-1.5-flash) — AI reasoning layer
- Google Identity Services — Google Sign-In
- Google Sheets API / Context API — wait times and crowd reports
- Google Maps JavaScript API — venue map + heatmap
- Google Places Autocomplete — venue search
- Vitest + React Testing Library — test suite
- vite-plugin-pwa — offline support

## Setup
```bash
npm install
cp .env.example .env   # fill in your API keys
npm run dev
npm run test
```
