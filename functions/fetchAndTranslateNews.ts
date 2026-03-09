import { createClientFromRequest } from 'npm:@base44/sdk@0.8.20';

function parseRSS(text, authorName, region) {
  const items = [];
  const itemRegex = /<item>([\s\S]*?)<\/item>/g;
  let match;
  while ((match = itemRegex.exec(text)) !== null) {
    const c = match[1];
    const titleMatch = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/.exec(c) || /<title>(.*?)<\/title>/.exec(c);
    const descMatch = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/.exec(c) || /<description>(.*?)<\/description>/.exec(c);
    const linkMatch = /<link>(.*?)<\/link>/.exec(c);
    if (titleMatch && descMatch) {
      items.push({
        headline: titleMatch[1].trim(),
        content: descMatch[1].trim().replace(/<[^>]*>/g, '').slice(0, 400),
        source_url: linkMatch ? linkMatch[1].trim() : '',
        author_name: authorName,
        region,
      });
    }
  }
  return items;
}

async function fetchSource(url, authorName, region) {
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(8000) });
    if (!res.ok) return [];
    const text = await res.text();
    return parseRSS(text, authorName, region);
  } catch (_) {
    return [];
  }
}

async function analyzeArticle(base44, headline, content) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Analyze this news article and return all of the following in a single response:
1. Translate headline and content to Arabic (ar).
2. Market sentiment (bullish/bearish).
3. A concise executive summary focused on geopolitical implications (1-2 sentences).
4. Key geopolitical impacts (2-3 bullet points).
5. Any financial assets (stocks, commodities, crypto) mentioned.

Headline: ${headline}
Content: ${content}`,
    response_json_schema: {
      type: "object",
      properties: {
        headline_ar: { type: "string" },
        content_ar: { type: "string" },
        sentiment: { type: "string", enum: ["very_positive", "positive", "neutral", "negative", "very_negative"] },
        sentiment_confidence: { type: "number" },
        mentioned_assets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              symbol: { type: "string" },
              type: { type: "string", enum: ["stock", "commodity", "crypto"] }
            }
          }
        },
        executive_summary: { type: "string" },
        key_impacts: { type: "array", items: { type: "string" } }
      }
    }
  });

  return {
    headline_ar: result.headline_ar || headline,
    content_ar: result.content_ar || content,
    sentiment: result.sentiment || 'neutral',
    sentiment_confidence: result.sentiment_confidence || 0.5,
    mentioned_assets: result.mentioned_assets || [],
    executive_summary: result.executive_summary || '',
    key_impacts: result.key_impacts || []
  };
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    if (!user) return Response.json({ error: 'Unauthorized' }, { status: 401 });

    // 1. Fetch all RSS sources in parallel
    const [bbc, guardian, aljazeera, reuters, shehab] = await Promise.all([
      fetchSource('https://feeds.bbci.co.uk/news/world/rss.xml', 'BBC News', 'Global'),
      fetchSource('https://www.theguardian.com/world/rss', 'The Guardian', 'Global'),
      fetchSource('https://www.aljazeera.com/xml/rss/all.xml', 'Al Jazeera', 'Global'),
      fetchSource('https://feeds.reuters.com/reuters/worldNews', 'Reuters', 'Global'),
      fetchSource('https://t.me/s/ShehabTelegram2/rss', '@ShehabTelegram2', 'Middle East'),
    ]);

    // Also fetch NewsData.io (API, not RSS)
    let newsdataItems = [];
    try {
      const newsdataKey = Deno.env.get('NEWSDATA_API_KEY');
      if (newsdataKey) {
        const res = await fetch(
          `https://newsdata.io/api/1/latest?apikey=${newsdataKey}&q=war+conflict+military&language=en&category=politics,world`,
          { signal: AbortSignal.timeout(8000) }
        );
        if (res.ok) {
          const data = await res.json();
          newsdataItems = (data.results || []).filter(a => a.title).map(a => ({
            headline: a.title,
            content: (a.description || a.ai_summary || '').slice(0, 400),
            source_url: a.link || '',
            author_name: a.source_name || 'NewsData.io',
            region: a.country?.[0] || 'Global',
          }));
        }
      }
    } catch (_) {}

    const allItems = [...bbc, ...guardian, ...aljazeera, ...reuters, ...shehab, ...newsdataItems];

    // 2. Deduplicate against existing posts BEFORE running LLM
    const existingPosts = await base44.entities.NewsPost.list('-created_date', 100);
    const existingHeadlines = new Set(existingPosts.map(p => p.headline));
    const newItems = allItems.filter(item => item.headline && !existingHeadlines.has(item.headline));

    if (newItems.length === 0) {
      return Response.json({ success: true, itemsFetched: allItems.length, itemsSaved: 0 });
    }

    // 3. Analyze up to 4 new articles in parallel
    const toAnalyze = newItems.slice(0, 4);
    const analyses = await Promise.all(
      toAnalyze.map(item => analyzeArticle(base44, item.headline, item.content))
    );

    const toSave = toAnalyze.map((item, i) => ({
      ...item,
      verification_status: 'pending',
      headline_ar: analyses[i].headline_ar,
      content_ar: analyses[i].content_ar,
      sentiment: analyses[i].sentiment,
      sentiment_confidence: analyses[i].sentiment_confidence,
      mentioned_assets: analyses[i].mentioned_assets,
      executive_summary: analyses[i].executive_summary,
      key_impacts: analyses[i].key_impacts,
    }));

    await base44.entities.NewsPost.bulkCreate(toSave);

    return Response.json({ success: true, itemsFetched: allItems.length, itemsSaved: toSave.length });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});