import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

const SUPPORTED_LANGS = ['en', 'ar', 'fr', 'es', 'pt', 'ru', 'tr', 'fa'];

async function translateNews(base44, headline, content, targetLangs) {
  const translations = { headline: {}, content: {} };

  for (const lang of targetLangs) {
    if (lang === 'auto') continue;
    
    const result = await base44.integrations.Core.InvokeLLM({
      prompt: `Detect the source language and translate the following news to ${getLangName(lang)}. Keep the same meaning and tone. Just provide the translation, no explanations.\n\nHeadline: ${headline}\n\nContent: ${content}`,
      response_json_schema: {
        type: "object",
        properties: {
          headline: { type: "string" },
          content: { type: "string" }
        }
      }
    });

    translations.headline[`${lang}`] = result.headline || headline;
    translations.content[`${lang}`] = result.content || content;
  }

  return translations;
}

async function analyzeSentiment(base44, headline, content) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Analyze the market sentiment of this news article. Consider whether it's bullish or bearish for markets in general.\n\nHeadline: ${headline}\n\nContent: ${content}\n\nRespond with sentiment level and confidence.`,
    response_json_schema: {
      type: "object",
      properties: {
        sentiment: { type: "string", enum: ["very_positive", "positive", "neutral", "negative", "very_negative"], description: "Market sentiment" },
        confidence: { type: "number", description: "Confidence score 0.0-1.0" },
        mentioned_assets: {
          type: "array",
          items: {
            type: "object",
            properties: {
              symbol: { type: "string" },
              type: { type: "string", enum: ["stock", "commodity", "crypto"] }
            }
          },
          description: "Assets mentioned in the article"
        }
      }
    }
  });
  
  return {
    sentiment: result.sentiment || 'neutral',
    sentiment_confidence: result.confidence || 0.5,
    mentioned_assets: result.mentioned_assets || []
  };
}

async function generateExecutiveSummary(base44, headline, content) {
  const result = await base44.integrations.Core.InvokeLLM({
    prompt: `Create a concise executive summary (2-3 sentences max) of this news article with focus on geopolitical implications and conflict-related impacts.\n\nHeadline: ${headline}\n\nContent: ${content}\n\nProvide: 1) A brief 1-sentence summary, 2) Key geopolitical impacts (2-3 bullet points).`,
    response_json_schema: {
      type: "object",
      properties: {
        summary: { type: "string", description: "Concise 1-2 sentence executive summary" },
        impacts: { type: "array", items: { type: "string" }, description: "Key geopolitical impacts" }
      }
    }
  });
  
  return {
    executive_summary: result.summary || '',
    key_impacts: result.impacts || []
  };
}

function getLangName(code) {
  const names = {
    en: 'English',
    ar: 'Arabic',
    fr: 'French',
    es: 'Spanish',
    pt: 'Portuguese',
    ru: 'Russian',
    tr: 'Turkish',
    fa: 'Farsi'
  };
  return names[code] || 'English';
}

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { targetLanguages = ['en', 'ar'] } = await req.json().catch(() => ({}));
    const langs = targetLanguages.filter(l => SUPPORTED_LANGS.includes(l));

    const items = [];

    // Fetch RSS feed from @ShehabTelegram2
    try {
      const rssUrl = 'https://t.me/s/ShehabTelegram2/rss';
      const rssResponse = await fetch(rssUrl);

      if (rssResponse.ok) {
        const rssText = await rssResponse.text();

        // Parse RSS feed
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;

        while ((match = itemRegex.exec(rssText)) !== null) {
          const itemContent = match[1];

          const titleMatch = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/.exec(itemContent) || 
                             /<title>(.*?)<\/title>/.exec(itemContent);
          const descMatch = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/.exec(itemContent) ||
                           /<description>(.*?)<\/description>/.exec(itemContent);
          const linkMatch = /<link>(.*?)<\/link>/.exec(itemContent);

          if (titleMatch && descMatch) {
            items.push({
              headline: titleMatch[1].trim(),
              content: descMatch[1].trim().replace(/<[^>]*>/g, ''),
              source_url: linkMatch ? linkMatch[1].trim() : '',
              author_name: '@ShehabTelegram2',
              region: 'Middle East'
            });
          }
        }
      }
    } catch (error) {
      console.log('RSS feed fetch failed:', error.message);
    }

    // Fetch from NewsAPI.org
    try {
      const newsApiKey = Deno.env.get('NEWS_API_KEY');
      if (newsApiKey) {
        const newsApiUrl = `https://newsapi.org/v2/everything?q=conflict+war+geopolitics&sortBy=publishedAt&language=en&pageSize=10&apiKey=${newsApiKey}`;
        const newsResponse = await fetch(newsApiUrl);

        if (newsResponse.ok) {
          const newsData = await newsResponse.json();

          (newsData.articles || []).forEach(article => {
            items.push({
              headline: article.title,
              content: article.description || article.content || '',
              source_url: article.url,
              author_name: article.author || article.source.name,
              region: 'Global'
            });
          });
        }
      }
    } catch (error) {
      console.log('NewsAPI fetch failed:', error.message);
    }

    // Fetch BBC News RSS
    try {
      const bbcUrl = 'http://feeds.bbc.co.uk/news/world/rss.xml';
      const bbcResponse = await fetch(bbcUrl);
      if (bbcResponse.ok) {
        const bbcText = await bbcResponse.text();
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        while ((match = itemRegex.exec(bbcText)) !== null) {
          const itemContent = match[1];
          const titleMatch = /<title>(.*?)<\/title>/.exec(itemContent);
          const descMatch = /<description>(.*?)<\/description>/.exec(itemContent);
          const linkMatch = /<link>(.*?)<\/link>/.exec(itemContent);
          if (titleMatch && descMatch) {
            items.push({
              headline: titleMatch[1].trim(),
              content: descMatch[1].trim().replace(/<[^>]*>/g, ''),
              source_url: linkMatch ? linkMatch[1].trim() : '',
              author_name: 'BBC News',
              region: 'Global'
            });
          }
        }
      }
    } catch (error) {
      console.log('BBC RSS fetch failed:', error.message);
    }

    // Fetch Guardian World News RSS
    try {
      const guardianUrl = 'https://www.theguardian.com/world/rss';
      const guardianResponse = await fetch(guardianUrl);
      if (guardianResponse.ok) {
        const guardianText = await guardianResponse.text();
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        while ((match = itemRegex.exec(guardianText)) !== null) {
          const itemContent = match[1];
          const titleMatch = /<title>(.*?)<\/title>/.exec(itemContent);
          const descMatch = /<description>(.*?)<\/description>/.exec(itemContent);
          const linkMatch = /<link>(.*?)<\/link>/.exec(itemContent);
          if (titleMatch && descMatch) {
            items.push({
              headline: titleMatch[1].trim(),
              content: descMatch[1].trim().replace(/<[^>]*>/g, ''),
              source_url: linkMatch ? linkMatch[1].trim() : '',
              author_name: 'The Guardian',
              region: 'Global'
            });
          }
        }
      }
    } catch (error) {
      console.log('Guardian RSS fetch failed:', error.message);
    }

    // Fetch Al Jazeera English RSS
    try {
      const alJazeeraUrl = 'https://www.aljazeera.com/xml/rss/all.xml';
      const alJazeeraResponse = await fetch(alJazeeraUrl);
      if (alJazeeraResponse.ok) {
        const alJazeeraText = await alJazeeraResponse.text();
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        while ((match = itemRegex.exec(alJazeeraText)) !== null) {
          const itemContent = match[1];
          const titleMatch = /<title>(.*?)<\/title>/.exec(itemContent);
          const descMatch = /<description>(.*?)<\/description>/.exec(itemContent);
          const linkMatch = /<link>(.*?)<\/link>/.exec(itemContent);
          if (titleMatch && descMatch) {
            items.push({
              headline: titleMatch[1].trim(),
              content: descMatch[1].trim().replace(/<[^>]*>/g, ''),
              source_url: linkMatch ? linkMatch[1].trim() : '',
              author_name: 'Al Jazeera',
              region: 'Global'
            });
          }
        }
      }
    } catch (error) {
      console.log('Al Jazeera RSS fetch failed:', error.message);
    }

    // Fetch from NewsData.io
    try {
      const newsdataKey = Deno.env.get('NEWSDATA_API_KEY');
      if (newsdataKey) {
        const newsdataUrl = `https://newsdata.io/api/1/latest?apikey=${newsdataKey}&q=war+conflict+military+geopolitics&language=en&category=politics,world`;
        const newsdataResponse = await fetch(newsdataUrl);
        if (newsdataResponse.ok) {
          const newsdataData = await newsdataResponse.json();
          (newsdataData.results || []).forEach(article => {
            if (!article.title) return;
            items.push({
              headline: article.title,
              content: article.description || article.ai_summary || article.content?.substring(0, 500) || '',
              source_url: article.link || '',
              author_name: article.source_name || article.creator?.[0] || 'NewsData.io',
              region: article.country?.[0] || 'Global'
            });
          });
        }
      }
    } catch (error) {
      console.log('NewsData.io fetch failed:', error.message);
    }

    // Fetch Reuters News RSS
    try {
      const reutersUrl = 'https://www.reutersagency.com/rssFeed/worldNews';
      const reutersResponse = await fetch(reutersUrl);
      if (reutersResponse.ok) {
        const reutersText = await reutersResponse.text();
        const itemRegex = /<item>([\s\S]*?)<\/item>/g;
        let match;
        while ((match = itemRegex.exec(reutersText)) !== null) {
          const itemContent = match[1];
          const titleMatch = /<title>(.*?)<\/title>/.exec(itemContent);
          const descMatch = /<description>(.*?)<\/description>/.exec(itemContent);
          const linkMatch = /<link>(.*?)<\/link>/.exec(itemContent);
          if (titleMatch && descMatch) {
            items.push({
              headline: titleMatch[1].trim(),
              content: descMatch[1].trim().replace(/<[^>]*>/g, ''),
              source_url: linkMatch ? linkMatch[1].trim() : '',
              author_name: 'Reuters',
              region: 'Global'
            });
          }
        }
      }
    } catch (error) {
      console.log('Reuters RSS fetch failed:', error.message);
    }

    const translatedItems = [];

    for (const item of items.slice(0, 10)) {
      const trans = await translateNews(base44, item.headline, item.content, langs);
      const sentiment = await analyzeSentiment(base44, item.headline, item.content);
      const summary = await generateExecutiveSummary(base44, item.headline, item.content);
      
      const translatedItem = {
        ...item,
        verification_status: 'pending',
        sentiment: sentiment.sentiment,
        sentiment_confidence: sentiment.sentiment_confidence,
        mentioned_assets: sentiment.mentioned_assets,
        executive_summary: summary.executive_summary,
        key_impacts: summary.key_impacts
      };
      
      langs.forEach(lang => {
        translatedItem[`headline_${lang}`] = trans.headline[lang];
        translatedItem[`content_${lang}`] = trans.content[lang];
      });

      translatedItems.push(translatedItem);
    }

    const existingPosts = await base44.entities.NewsPost.list('-created_date', 100);
    const existingHeadlines = new Set(existingPosts.map(p => p.headline));

    const newItems = translatedItems.filter(item => !existingHeadlines.has(item.headline));

    if (newItems.length > 0) {
      await base44.entities.NewsPost.bulkCreate(newItems);
    }

    return Response.json({
      success: true,
      itemsFetched: items.length,
      itemsTranslated: translatedItems.length,
      itemsSaved: newItems.length
    });
  } catch (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }
});