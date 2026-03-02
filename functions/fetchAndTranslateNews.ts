import { createClientFromRequest } from 'npm:@base44/sdk@0.8.6';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();

    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Fetch RSS feed from @ShehabTelegram2
    const rssUrl = 'https://t.me/s/ShehabTelegram2/rss';
    const rssResponse = await fetch(rssUrl);
    
    if (!rssResponse.ok) {
      return Response.json({ error: 'Failed to fetch RSS feed' }, { status: 500 });
    }

    const rssText = await rssResponse.text();
    
    // Parse RSS feed (basic XML parsing)
    const itemRegex = /<item>([\s\S]*?)<\/item>/g;
    const items = [];
    let match;

    while ((match = itemRegex.exec(rssText)) !== null) {
      const itemContent = match[1];
      
      const titleMatch = /<title><!\[CDATA\[([\s\S]*?)\]\]><\/title>/.exec(itemContent) || 
                        /<title>(.*?)<\/title>/.exec(itemContent);
      const descMatch = /<description><!\[CDATA\[([\s\S]*?)\]\]><\/description>/.exec(itemContent) ||
                       /<description>(.*?)<\/description>/.exec(itemContent);
      const linkMatch = /<link>(.*?)<\/link>/.exec(itemContent);
      const pubDateMatch = /<pubDate>(.*?)<\/pubDate>/.exec(itemContent);

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

    // Translate each item to English and Arabic
    const translatedItems = [];

    for (const item of items.slice(0, 10)) {
      // Translate to English
      const enResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following Arabic news headline and content to English. Keep the same meaning and tone. Just provide the translation, no explanations.\n\nHeadline: ${item.headline}\n\nContent: ${item.content}`,
        response_json_schema: {
          type: "object",
          properties: {
            headline: { type: "string" },
            content: { type: "string" }
          }
        }
      });

      // Translate to Arabic (in case original is not Arabic)
      const arResult = await base44.integrations.Core.InvokeLLM({
        prompt: `Translate the following news headline and content to Arabic. Keep the same meaning and tone. Just provide the translation, no explanations.\n\nHeadline: ${item.headline}\n\nContent: ${item.content}`,
        response_json_schema: {
          type: "object",
          properties: {
            headline: { type: "string" },
            content: { type: "string" }
          }
        }
      });

      translatedItems.push({
        ...item,
        headline_en: enResult.headline || item.headline,
        content_en: enResult.content || item.content,
        headline_ar: arResult.headline || item.headline,
        content_ar: arResult.content || item.content,
        verification_status: 'pending'
      });
    }

    // Check for duplicates and save to database
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