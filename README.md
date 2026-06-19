# HorizonFit — Global Study Abroad Matcher

## Setup (requires Node.js 18+)

```bash
cd horizonfit
npm install
npm run dev
```

Open http://localhost:5173

## Routes
- `/`          — Landing page (Show, Don't Tell + city previews)
- `/assess`    — 5-step assessment wizard
- `/dashboard` — Ranked results + deep-dive comparison

## File structure
```
src/
  data/cityData.js          ← All city data (Boston / Paris / Netherlands)
  lib/matchingEngine.js     ← Weighted scoring + tolerance re-weighting
  lib/clustering.js         ← K-means nearest-centroid archetype classifier
  pages/
    Landing.jsx             ← Hero + Show Don't Tell sections
    Assessment.jsx          ← 5-step wizard
    Dashboard.jsx           ← Results, city detail, all tabs
  components/
    ToleranceModal.jsx      ← Trade-off tolerance slider popup
    CostForecastChart.jsx   ← Recharts line chart (actual + forecast)
    DimensionChart.jsx      ← Recharts radar + bar breakdown
    WhyThisMatches.jsx      ← Simulated streaming LLM explanation
    LivedExperience.jsx     ← Student quotes with bias notes
    PeerConnect.jsx         ← Ambassador profile + live timezone
```

## How the matching algorithm works

1. User sets priority weights (1–10) for 6 dimensions: Career, Cost, Safety, Social, Diversity, Healthcare
2. Cultural bonuses added for religion, alcohol preference, social style, field of study, budget
3. If the top city has a weakness the user cares about, a **Tolerance Modal** fires — user rates how much they'd tolerate it (1–10)
4. Tolerance re-weights: low tolerance keeps the penalty; high tolerance reduces it
5. Cities re-ranked with adjusted weights
6. User classified into one of 4 archetypes via nearest-centroid distance

## Data sources
Numbeo, Kamernet, SpareRoom, Studapart, HousingAnywhere, AmberStudent, Unisova, Leboncoin — plus synthesised student forum / YouTube vlog transcripts.
