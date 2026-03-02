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

    const translatedItems = [];

    for (const item of items.slice(0, 10)) {
      const trans = await translateNews(base44, item.headline, item.content, langs);
      
      const translatedItem = { ...item, verification_status: 'pending' };
      
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