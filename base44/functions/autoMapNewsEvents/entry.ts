import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

const COUNTRY_COORDS = {
  "Afghanistan": [33.93, 67.71], "Albania": [41.15, 20.17], "Algeria": [28.03, 1.66],
  "Angola": [-11.20, 17.87], "Argentina": [-38.42, -63.62], "Armenia": [40.07, 45.04],
  "Australia": [-25.27, 133.78], "Austria": [47.52, 14.55], "Azerbaijan": [40.14, 47.58],
  "Bahrain": [26.0, 50.56], "Bangladesh": [23.68, 90.36], "Belarus": [53.71, 27.95],
  "Belgium": [50.50, 4.47], "Bolivia": [-16.29, -63.59], "Bosnia": [43.92, 17.68],
  "Brazil": [-14.24, -51.93], "Bulgaria": [42.73, 25.49], "Burkina Faso": [12.36, -1.53],
  "Cameroon": [3.85, 11.50], "Canada": [56.13, -106.35], "Central African Republic": [6.61, 20.94],
  "Chad": [15.45, 18.73], "Chile": [-35.68, -71.54], "China": [35.86, 104.19],
  "Colombia": [4.57, -74.30], "Congo": [-4.04, 21.76], "Croatia": [45.10, 15.20],
  "Cuba": [21.52, -77.78], "Czech Republic": [49.82, 15.47], "Denmark": [56.26, 9.50],
  "Ecuador": [-1.83, -78.18], "Egypt": [26.82, 30.80], "Eritrea": [15.18, 39.78],
  "Ethiopia": [9.15, 40.49], "Finland": [61.92, 25.75], "France": [46.23, 2.21],
  "Gaza": [31.35, 34.31], "Georgia": [42.32, 43.36], "Germany": [51.17, 10.45],
  "Ghana": [7.95, -1.02], "Greece": [39.07, 21.82], "Guatemala": [15.78, -90.23],
  "Guinea": [11.00, -10.94], "Haiti": [18.97, -72.29], "Hungary": [47.16, 19.50],
  "India": [20.59, 78.96], "Indonesia": [-0.79, 113.92], "Iran": [32.43, 53.69],
  "Iraq": [33.22, 43.68], "Ireland": [53.41, -8.24], "Israel": [31.05, 34.85],
  "Italy": [41.87, 12.57], "Japan": [36.20, 138.25], "Jordan": [30.59, 36.24],
  "Kazakhstan": [48.02, 66.92], "Kenya": [-0.02, 37.91], "Kuwait": [29.31, 47.48],
  "Lebanon": [33.85, 35.86], "Libya": [26.34, 17.23], "Malaysia": [4.21, 108.96],
  "Mali": [17.57, -3.99], "Mexico": [23.63, -102.55], "Moldova": [47.41, 28.37],
  "Morocco": [31.79, -7.09], "Mozambique": [-18.67, 35.53], "Myanmar": [21.92, 95.96],
  "Netherlands": [52.13, 5.29], "Niger": [17.61, 8.08], "Nigeria": [9.08, 8.68],
  "North Korea": [40.34, 127.51], "Norway": [60.47, 8.47], "Oman": [21.51, 55.92],
  "Pakistan": [30.38, 69.35], "Palestine": [31.95, 35.23], "Peru": [-9.19, -75.02],
  "Philippines": [12.88, 121.77], "Poland": [51.92, 19.14], "Portugal": [39.40, -8.22],
  "Qatar": [25.35, 51.18], "Romania": [45.94, 24.97], "Russia": [61.52, 105.32],
  "Saudi Arabia": [23.89, 45.08], "Senegal": [14.50, -14.45], "Serbia": [44.02, 21.01],
  "Somalia": [5.15, 46.20], "South Africa": [-30.56, 22.94], "South Korea": [35.91, 127.77],
  "South Sudan": [6.88, 31.31], "Spain": [40.46, -3.75], "Sudan": [12.86, 30.22],
  "Sweden": [60.13, 18.64], "Switzerland": [46.82, 8.23], "Syria": [34.80, 38.99],
  "Taiwan": [23.70, 121.00], "Tajikistan": [38.86, 71.28], "Tanzania": [-6.37, 34.89],
  "Thailand": [15.87, 100.99], "Tunisia": [33.89, 9.54], "Turkey": [38.96, 35.24],
  "Turkmenistan": [38.97, 59.56], "UAE": [23.42, 53.85], "Uganda": [1.37, 32.29],
  "Ukraine": [48.38, 31.17], "United Kingdom": [55.38, -3.44], "United States": [37.09, -95.71],
  "USA": [37.09, -95.71], "UK": [55.38, -3.44], "Uzbekistan": [41.38, 64.59],
  "Venezuela": [6.42, -66.59], "Vietnam": [14.06, 108.28], "West Bank": [31.95, 35.30],
  "Yemen": [15.55, 48.52], "Zambia": [-13.13, 27.85], "Zimbabwe": [-19.02, 29.15],
};

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // Get recent news posts that haven't been mapped yet
    const recentPosts = await base44.entities.NewsPost.list('-created_date', 20);
    const existingEvents = await base44.entities.ConflictEvent.list('-created_date', 200);

    // Track which news headlines already have events
    const mappedHeadlines = new Set(
      existingEvents
        .filter(e => e.tags?.includes('ai-news-report'))
        .map(e => e.title)
    );

    const unmapped = recentPosts.filter(p => !mappedHeadlines.has(p.headline));
    if (unmapped.length === 0) {
      return Response.json({ success: true, created: 0, message: 'No new articles to map' });
    }

    // Ask AI to analyze each article and produce a map event if conflict-relevant
    const toProcess = unmapped.slice(0, 5); // limit per call
    const created = [];

    for (const post of toProcess) {
      const result = await base44.integrations.Core.InvokeLLM({
        prompt: `You are a conflict intelligence analyst. Analyze this news article and determine if it describes a real-world conflict event (military action, airstrike, missile, explosion, clash, armed threat, cyberattack, naval incident, or significant geopolitical escalation).

Headline: ${post.headline}
Content: ${post.content || post.executive_summary || ''}

If it IS a conflict event, extract:
- A short event title (max 80 chars)
- Summary (1-2 sentences)
- Severity: HIGH, MEDIUM, or LOW
- Event type: one of airstrike, missile, explosion, clash, threat, diplomatic, cyberattack, naval, other
- Country name (must be a real country or territory)
- Region (city/area if known)
- is_escalation: true if this represents an escalation

If it is NOT a conflict event (e.g. purely political speech, economic news, sports), set is_conflict to false.`,
        response_json_schema: {
          type: "object",
          properties: {
            is_conflict: { type: "boolean" },
            title: { type: "string" },
            summary: { type: "string" },
            severity: { type: "string" },
            event_type: { type: "string" },
            country: { type: "string" },
            region: { type: "string" },
            is_escalation: { type: "boolean" },
          }
        }
      });

      if (!result.is_conflict) continue;

      const countryCoords = COUNTRY_COORDS[result.country];
      if (!countryCoords) continue; // skip if we can't pin it

      const event = await base44.entities.ConflictEvent.create({
        title: result.title || post.headline.slice(0, 80),
        summary: result.summary || post.executive_summary || '',
        severity: ['HIGH', 'MEDIUM', 'LOW'].includes(result.severity) ? result.severity : 'MEDIUM',
        event_type: result.event_type || 'other',
        country: result.country,
        region: result.region || '',
        latitude: countryCoords[0],
        longitude: countryCoords[1],
        is_escalation: result.is_escalation || false,
        confidence: 0.7,
        sources: [post.source_url].filter(Boolean),
        tags: ['ai-news-report'],
        ai_analysis: `Auto-generated from news: "${post.headline}"`
      });

      created.push(event.id);
    }

    return Response.json({ success: true, created: created.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});