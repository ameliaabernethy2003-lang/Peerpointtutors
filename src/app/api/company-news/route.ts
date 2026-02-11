import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const companyName = searchParams.get('company');
  const ticker = searchParams.get('ticker');

  if (!ticker) {
    return NextResponse.json(
      { error: 'Ticker is required for Yahoo Finance news' },
      { status: 400 }
    );
  }

  try {
    // Fetch news from Yahoo Finance RSS feed only
    const yahooRssUrl = `https://feeds.finance.yahoo.com/rss/2.0/headline?s=${ticker}&region=US&lang=en-US`;
    
    const response = await fetch(yahooRssUrl, {
      headers: {
        'User-Agent': 'SG&A Financial Dashboard/1.0 (contact@example.com)',
      },
    });
    
    if (!response.ok) {
      throw new Error('Failed to fetch news from Yahoo Finance');
    }
    
    const xmlText = await response.text();
    const itemMatches = xmlText.match(/<item>[\s\S]*?<\/item>/g) || [];
    
    // Calculate date range (2 years back)
    const twoYearsAgo = new Date();
    twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
    
    const articles = itemMatches
      .map((item: string) => {
        const titleMatch = item.match(/<title><!\[CDATA\[(.*?)\]\]><\/title>|<title>(.*?)<\/title>/);
        const linkMatch = item.match(/<link>(.*?)<\/link>/);
        const pubDateMatch = item.match(/<pubDate>(.*?)<\/pubDate>/);
        const descriptionMatch = item.match(/<description><!\[CDATA\[(.*?)\]\]><\/description>|<description>(.*?)<\/description>/);
        
        const title = (titleMatch?.[1] || titleMatch?.[2] || '').replace(/<[^>]*>/g, '').trim();
        const url = linkMatch?.[1] || '';
        const pubDate = pubDateMatch?.[1] ? new Date(pubDateMatch[1]) : new Date();
        const description = (descriptionMatch?.[1] || descriptionMatch?.[2] || '').replace(/<[^>]*>/g, '').trim().substring(0, 200);
        
        return {
          title,
          url,
          publishedAt: pubDate.toISOString(),
          description,
          source: 'Yahoo Finance',
        };
      })
      .filter((article: any) => {
        // Filter by date (last 2 years) and ensure we have title and URL
        const articleDate = new Date(article.publishedAt);
        return article.title && 
               article.url && 
               articleDate >= twoYearsAgo;
      })
      .sort((a: any, b: any) => {
        // Sort by date (most recent first)
        const dateA = new Date(a.publishedAt).getTime();
        const dateB = new Date(b.publishedAt).getTime();
        return dateB - dateA;
      })
      .slice(0, 10); // Limit to 10 most recent articles

    return NextResponse.json(articles);

  } catch (error: any) {
    console.error('Error fetching company news:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch company news' },
      { status: 500 }
    );
  }
}
