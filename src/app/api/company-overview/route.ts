import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const cik = searchParams.get('cik');
  const companyName = searchParams.get('company');

  if (!cik) {
    return NextResponse.json(
      { error: 'CIK is required' },
      { status: 400 }
    );
  }

  try {
    // Ensure CIK is zero-padded to 10 digits
    const paddedCik = cik.padStart(10, '0');
    
    // Fetch company information from SEC API
    const companyInfoUrl = `https://data.sec.gov/submissions/CIK${paddedCik}.json`;
    const companyResponse = await fetch(companyInfoUrl, {
      headers: {
        'User-Agent': 'SG&A Financial Dashboard/1.0 contact@example.com',
        'Accept': 'application/json',
      },
    });

    if (!companyResponse.ok) {
      throw new Error(`Failed to fetch company information: ${companyResponse.status} ${companyResponse.statusText}`);
    }

    const companyData = await companyResponse.json();
    
    // Get the most recent 10-K filing
    const filings = companyData.filings?.recent || {};
    const forms = filings.form || [];
    const accessionNumbers = filings.accessionNumber || [];
    const filingDates = filings.filingDate || [];
    
    let latest10K = null;
    let latest10KDate = null;
    let latest10KAccession = null;
    
    for (let i = 0; i < forms.length; i++) {
      if (forms[i] === '10-K' || forms[i] === '20-F') {
        const filingDate = filingDates[i];
        if (!latest10KDate || new Date(filingDate) > new Date(latest10KDate)) {
          latest10KDate = filingDate;
          latest10KAccession = accessionNumbers[i];
          latest10K = forms[i];
        }
      }
    }

    if (!latest10KAccession) {
      return NextResponse.json(
        { error: 'No 10-K filing found' },
        { status: 404 }
      );
    }

    // Construct the 10-K document URL
    // Accession number format: 0001670592-25-000008 -> 000167059225000008
    const accessionNumber = latest10KAccession.replace(/-/g, '');
    
    // Try multiple URL patterns for the filing index
    const indexUrlPatterns = [
      `https://www.sec.gov/Archives/edgar/data/${paddedCik}/${accessionNumber}/${latest10KAccession}-index.htm`,
      `https://www.sec.gov/Archives/edgar/data/${paddedCik}/${accessionNumber}/${accessionNumber}-index.htm`,
      `https://www.sec.gov/Archives/edgar/data/${cik}/${accessionNumber}/${latest10KAccession}-index.htm`,
      `https://www.sec.gov/Archives/edgar/data/${cik}/${accessionNumber}/${accessionNumber}-index.htm`,
    ];
    
    let indexHtml = '';
    let docUrl = '';
    
    // Try each URL pattern until one works
    for (const filingIndexUrl of indexUrlPatterns) {
      try {
        const indexResponse = await fetch(filingIndexUrl, {
          headers: {
            'User-Agent': 'SG&A Financial Dashboard/1.0 contact@example.com',
            'Accept': 'text/html',
            'Accept-Language': 'en-US,en;q=0.9',
          },
        });

        if (indexResponse.ok) {
          indexHtml = await indexResponse.text();
          
          // Find the main 10-K document link - try multiple patterns
          // First, try to find links in table rows (most common SEC format)
          // Avoid XBRL viewer links - look for direct HTML document links
          const tableRowMatches = indexHtml.matchAll(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
          for (const rowMatch of tableRowMatches) {
            const row = rowMatch[0];
            // Check if this row contains "10-K" or "Annual" but NOT "XBRL" or "viewer"
            if (/10-?K|Annual|annual/i.test(row) && !/xbrl|viewer|interactive/i.test(row)) {
              // Look for HTML document links, but exclude XBRL viewer links
              const hrefMatch = row.match(/href=["']([^"']*\.(?:htm|html))["']/i);
              if (hrefMatch && !hrefMatch[1].toLowerCase().includes('xbrl') && 
                  !hrefMatch[1].toLowerCase().includes('viewer') &&
                  !hrefMatch[1].toLowerCase().includes('interactive')) {
                // Handle relative paths
                if (hrefMatch[1].startsWith('http')) {
                  docUrl = hrefMatch[1];
                } else if (hrefMatch[1].startsWith('/')) {
                  docUrl = `https://www.sec.gov${hrefMatch[1]}`;
                } else {
                  docUrl = `https://www.sec.gov/Archives/edgar/data/${paddedCik}/${accessionNumber}/${hrefMatch[1]}`;
                }
                break;
              }
            }
          }
          
          // If not found in table, try other patterns (avoiding XBRL)
          if (!docUrl) {
            const docLinkPatterns = [
              /<a[^>]*href=["']([^"']*(?:10-?k|10k|annual|form10k)[^"']*\.(?:htm|html))["'][^>]*>/i,
              /<a[^>]*href=["']([^"']*\.(?:htm|html))["'][^>]*>[\s\S]{0,200}(?:10-?K|10K|Annual|Form\s+10-?K)/i,
            ];
            
            for (const pattern of docLinkPatterns) {
              const docLinkMatch = indexHtml.match(pattern);
              if (docLinkMatch) {
                const docPath = docLinkMatch[1];
                // Exclude XBRL viewer links
                if (docPath && 
                    !docPath.includes('index') && 
                    !docPath.toLowerCase().includes('xbrl') &&
                    !docPath.toLowerCase().includes('viewer') &&
                    !docPath.toLowerCase().includes('interactive')) {
                  // Handle relative paths
                  if (docPath.startsWith('http')) {
                    docUrl = docPath;
                  } else if (docPath.startsWith('/')) {
                    docUrl = `https://www.sec.gov${docPath}`;
                  } else {
                    docUrl = `https://www.sec.gov/Archives/edgar/data/${paddedCik}/${accessionNumber}/${docPath}`;
                  }
                  break;
                }
              }
            }
          }
          
          // If still no URL, try to find the document by common naming patterns
          if (!docUrl) {
            // Common SEC document naming: accession-number.htm or company-ticker-date.htm
            const commonPatterns = [
              `${latest10KAccession}.htm`,
              `${latest10KAccession}.html`,
              `${accessionNumber}.htm`,
              `${accessionNumber}.html`,
            ];
            
            for (const pattern of commonPatterns) {
              const testUrl = `https://www.sec.gov/Archives/edgar/data/${paddedCik}/${accessionNumber}/${pattern}`;
              try {
                const testResponse = await fetch(testUrl, {
                  headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
                    'Accept': 'text/html',
                  },
                });
                if (testResponse.ok) {
                  const testText = await testResponse.text();
                  // Check if it's not an XBRL viewer page
                  if (!testText.includes('enable JavaScript') && 
                      !testText.includes('XBRL Viewer') &&
                      testText.length > 1000) {
                    docUrl = testUrl;
                    break;
                  }
                }
              } catch (e) {
                continue;
              }
            }
          }
          
          if (docUrl) break;
        }
      } catch (error) {
        console.error(`Failed to fetch from ${filingIndexUrl}:`, error);
        continue;
      }
    }
    
    if (!docUrl) {
      // Fallback: try to construct a common document name pattern
      const dateStr = latest10KDate ? latest10KDate.replace(/-/g, '') : '';
      const commonDocNames = [
        `${latest10KAccession}.htm`,
        `${latest10KAccession}.html`,
        `${accessionNumber}.htm`,
        `${accessionNumber}.html`,
      ];
      
      // Add date-based patterns if we have a date
      if (dateStr && dateStr.length >= 8) {
        commonDocNames.push(
          `yeti-${dateStr.substring(0, 4)}${dateStr.substring(4, 6)}${dateStr.substring(6, 8)}.htm`,
          `yeti-${dateStr.substring(0, 4)}${dateStr.substring(4, 6)}${dateStr.substring(6, 8)}.html`
        );
      }
      
      for (const docName of commonDocNames) {
        const testUrl = `https://www.sec.gov/Archives/edgar/data/${paddedCik}/${accessionNumber}/${docName}`;
        try {
          const testResponse = await fetch(testUrl, {
            headers: {
              'User-Agent': 'SG&A Financial Dashboard/1.0 contact@example.com',
              'Accept': 'text/html',
            },
          });
          if (testResponse.ok) {
            docUrl = testUrl;
            break;
          }
        } catch (e) {
          continue;
        }
      }
    }
    
    if (!docUrl) {
      return NextResponse.json(
        { error: 'Could not find or access 10-K document. The filing may not be available in HTML format.' },
        { status: 404 }
      );
    }

    // Fetch the 10-K document
    let docResponse;
    try {
      docResponse = await fetch(docUrl, {
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
          'Upgrade-Insecure-Requests': '1',
        },
      });
    } catch (fetchError: any) {
      console.error('Network error fetching document:', fetchError);
      return NextResponse.json(
        { error: `Network error: ${fetchError.message}. Please check your connection and try again.` },
        { status: 503 }
      );
    }

    if (!docResponse.ok) {
      // Try alternative document URLs before giving up
      const alternativeUrls = [
        docUrl.replace(/\.(htm|html)$/i, '.txt'),
        `https://www.sec.gov/Archives/edgar/data/${paddedCik}/${accessionNumber}/${latest10KAccession}.txt`,
        `https://www.sec.gov/Archives/edgar/data/${paddedCik}/${accessionNumber}/${accessionNumber}.txt`,
      ];
      
      let foundAlternative = false;
      for (const altUrl of alternativeUrls) {
        try {
          const altResponse = await fetch(altUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'text/plain,text/html',
            },
          });
          if (altResponse.ok) {
            docResponse = altResponse;
            docUrl = altUrl;
            foundAlternative = true;
            break;
          }
        } catch (e) {
          continue;
        }
      }
      
      if (!foundAlternative) {
        return NextResponse.json(
          { error: `Failed to fetch 10-K document. HTTP ${docResponse.status}: ${docResponse.statusText}. The document may not be available or the URL may be incorrect.` },
          { status: docResponse.status || 500 }
        );
      }
    }

    let docHtml = await docResponse.text();
    
    // Check if we got an XBRL viewer page instead of the actual document
    if (docHtml.includes('enable JavaScript') || 
        docHtml.includes('XBRL Viewer') || 
        docHtml.includes('Interactive Data')) {
      // Try to get the text version instead
      const textUrl = docUrl.replace(/\.(htm|html)$/i, '.txt');
      try {
        const textResponse = await fetch(textUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
            'Accept': 'text/plain,text/html',
          },
        });
        if (textResponse.ok) {
          docHtml = await textResponse.text();
        }
      } catch (e) {
        // If text version fails, try alternative document URL patterns
        const altUrl = docUrl.replace(/([^/]+)\.(htm|html)$/i, '$1-index.htm');
        try {
          const altResponse = await fetch(altUrl, {
            headers: {
              'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
              'Accept': 'text/html',
            },
          });
          if (altResponse.ok) {
            const altHtml = await altResponse.text();
            // Try to find the actual document link in the index
            const docLinkMatch = altHtml.match(/<a[^>]*href=["']([^"']*\.(?:htm|html))["'][^>]*>[\s\S]{0,200}(?:Complete|Full|Document)/i);
            if (docLinkMatch && !docLinkMatch[1].includes('xbrl') && !docLinkMatch[1].includes('viewer')) {
              const newDocPath = docLinkMatch[1];
              const newDocUrl = newDocPath.startsWith('http') 
                ? newDocPath 
                : `https://www.sec.gov/Archives/edgar/data/${paddedCik}/${accessionNumber}/${newDocPath}`;
              
              const newDocResponse = await fetch(newDocUrl, {
                headers: {
                  'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
                  'Accept': 'text/html',
                },
              });
              if (newDocResponse.ok) {
                docHtml = await newDocResponse.text();
              }
            }
          }
        } catch (e2) {
          // Continue with original HTML even if it's an XBRL viewer
        }
      }
    }
    
    if (!docHtml || docHtml.length < 1000) {
      return NextResponse.json(
        { error: '10-K document appears to be empty or too short' },
        { status: 404 }
      );
    }
    
    // If we still have an XBRL viewer page, return an error
    if (docHtml.includes('enable JavaScript') || docHtml.includes('XBRL Viewer')) {
      return NextResponse.json(
        { error: 'Unable to access 10-K document. The SEC is serving an XBRL viewer page that requires JavaScript. Please try again later or access the filing directly from sec.gov' },
        { status: 503 }
      );
    }
    
    // Parse the entire 10-K document to extract company overview
    try {
      return parse10KContent(docHtml, companyName || companyData.name || 'Company', companyData);
    } catch (parseError: any) {
      console.error('Error parsing 10-K content:', parseError);
      return NextResponse.json(
        { error: `Failed to parse 10-K content: ${parseError.message}` },
        { status: 500 }
      );
    }
    
  } catch (error: any) {
    console.error('Error fetching company overview:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch company overview' },
      { status: 500 }
    );
  }
}

function parse10KContent(html: string, companyName: string, companyData: any) {
  // Remove HTML tags but preserve structure for better parsing
  let text = html
    .replace(/<script[\s\S]*?<\/script>/gi, '')
    .replace(/<style[\s\S]*?<\/style>/gi, '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&apos;/g, "'")
    .trim();
  
  // Get company name from SEC data if available
  const secCompanyName = companyData?.name || companyName;

  const bullets: string[] = [];
  
  // Extract Item 1 section for better parsing
  const item1Section = text.match(/(?:item\s+1|part\s+i.*?item\s+1)[\s\S]{0,5000}(?=item\s+1a|item\s+2|part\s+ii)/i) || 
                       text.match(/(?:item\s+1|business)[\s\S]{0,3000}/i);
  
  // Extract direct quotes from Item 1 - look for complete sentences
  const extractQuotes = (sectionText: string, minLength: number = 80, maxLength: number = 350): string[] => {
    const quotes: string[] = [];
    
    if (!sectionText || sectionText.length < minLength) {
      return quotes;
    }
    
    // Split into sentences - use global flag
    const sentencePattern = /[^.!?]+[.!?]+/g;
    const sentences = sectionText.match(sentencePattern) || [];
    
    for (const sentence of sentences) {
      const cleaned = sentence.trim();
      // Look for substantive sentences that describe the business
      if (cleaned.length >= minLength && cleaned.length <= maxLength) {
        // Filter out generic or non-informative sentences
        const genericPatterns = [
          /^(we|the company|our company|company|corporation)\s+(is|are|was|were)$/i,
          /^(this|these|that|those)\s+(is|are|was|were)$/i,
          /^see\s+/i,
          /^refer\s+to/i,
          /^for\s+more\s+information/i,
          /^please\s+/i,
          /^table\s+of\s+contents/i,
          /^item\s+\d+/i,
        ];
        
        let isGeneric = false;
        for (const pattern of genericPatterns) {
          if (pattern.test(cleaned)) {
            isGeneric = true;
            break;
          }
        }
        
        // Also check if sentence has meaningful content (not just numbers or symbols)
        const hasMeaningfulContent = /[a-zA-Z]{3,}/.test(cleaned);
        
        if (!isGeneric && hasMeaningfulContent && cleaned.length >= minLength) {
          quotes.push(cleaned);
        }
      }
    }
    
    return quotes;
  };
  
  // 1. Company description/what it does - direct quote
  let quote1 = '';
  if (item1Section) {
    const item1Text = item1Section[0];
    // Get first few paragraphs
    const firstParagraphs = item1Text.substring(0, 2000);
    const quotes = extractQuotes(firstParagraphs, 60, 350);
    if (quotes.length > 0) {
      quote1 = quotes[0];
    }
  }
  
  if (!quote1) {
    // Fallback: extract from beginning of document
    const openingText = text.substring(0, 3000);
    const quotes = extractQuotes(openingText, 60, 350);
    if (quotes.length > 0) {
      quote1 = quotes[0];
    }
  }
  
  if (quote1) {
    bullets.push(quote1);
  }
  
  // 2. Products/services - direct quote
  let quote2 = '';
  if (item1Section) {
    const item1Text = item1Section[0];
    // Look for product/service descriptions
    const productSection = item1Text.match(/(?:products?|services?|offerings?|goods?)[\s\S]{0,1500}/i);
    if (productSection) {
      const quotes = extractQuotes(productSection[0], 80, 320);
      if (quotes.length > 0) {
        quote2 = quotes[0];
      }
    }
  }
  
  if (!quote2) {
    // Look for "we sell", "we manufacture", etc.
    const sellPattern = text.match(/(?:we|the company|our)[\s\S]{0,100}(?:sell|manufacture|produce|offer|provide|design|develop|distribute)[\s\S]{0,400}/i);
    if (sellPattern) {
      const quotes = extractQuotes(sellPattern[0], 80, 320);
      if (quotes.length > 0) {
        quote2 = quotes[0];
      }
    }
  }
  
  if (quote2) {
    bullets.push(quote2);
  }
  
  // 3. Business model/operations - direct quote
  let quote3 = '';
  if (item1Section) {
    const item1Text = item1Section[0];
    // Look for business model, operations, or strategy
    const operationsSection = item1Text.match(/(?:business model|operating|operations?|strategy|revenue)[\s\S]{0,1500}/i);
    if (operationsSection) {
      const quotes = extractQuotes(operationsSection[0], 80, 320);
      if (quotes.length > 0) {
        quote3 = quotes[0];
      }
    }
  }
  
  if (!quote3) {
    // Look for "we operate", "we generate revenue", etc.
    const operatePattern = text.match(/(?:we|the company)[\s\S]{0,100}(?:operate|generate|earn|receive|derive)[\s\S]{0,400}/i);
    if (operatePattern) {
      const quotes = extractQuotes(operatePattern[0], 80, 320);
      if (quotes.length > 0) {
        quote3 = quotes[0];
      }
    }
  }
  
  if (quote3) {
    bullets.push(quote3);
  }
  
  // 4. Market/competitive position - direct quote
  let quote4 = '';
  if (item1Section) {
    const item1Text = item1Section[0];
    // Look for market, industry, or competitive information
    const marketSection = item1Text.match(/(?:market|industry|sector|competitive|competition)[\s\S]{0,1500}/i);
    if (marketSection) {
      const quotes = extractQuotes(marketSection[0], 80, 320);
      if (quotes.length > 0) {
        quote4 = quotes[0];
      }
    }
  }
  
  if (!quote4) {
    // Look for "we compete", "in the market", etc.
    const competePattern = text.match(/(?:we|the company)[\s\S]{0,100}(?:compete|operate)[\s\S]{0,200}(?:in|within)[\s\S]{0,300}/i);
    if (competePattern) {
      const quotes = extractQuotes(competePattern[0], 80, 320);
      if (quotes.length > 0) {
        quote4 = quotes[0];
      }
    }
  }
  
  if (quote4) {
    bullets.push(quote4);
  }
  
  // 5. Geographic presence/location - direct quote
  let quote5 = '';
  if (item1Section) {
    const item1Text = item1Section[0];
    // Look for geographic, location, or presence information
    const geoSection = item1Text.match(/(?:geographic|geographical|location|headquarters|operates?|presence|markets?)[\s\S]{0,1500}/i);
    if (geoSection) {
      const quotes = extractQuotes(geoSection[0], 80, 320);
      if (quotes.length > 0) {
        quote5 = quotes[0];
      }
    }
  }
  
  if (!quote5) {
    // Look for "we operate in", "headquartered", etc.
    const locationPattern = text.match(/(?:headquarters|headquartered|located|operates?)[\s\S]{0,300}/i);
    if (locationPattern) {
      const quotes = extractQuotes(locationPattern[0], 80, 320);
      if (quotes.length > 0) {
        quote5 = quotes[0];
      }
    }
  }
  
  if (quote5) {
    bullets.push(quote5);
  }
  
  // If we don't have 5 quotes, try to extract more from Item 1
  if (bullets.length < 5 && item1Section) {
    const item1Text = item1Section[0];
    const allQuotes = extractQuotes(item1Text, 60, 350);
    
    // Add unique quotes until we have 5
    for (const quote of allQuotes) {
      if (bullets.length >= 5) break;
      
      // Check if this quote is similar to existing ones
      let isDuplicate = false;
      for (const existing of bullets) {
        // Simple similarity check - if more than 50% words overlap, skip
        const quoteWords = new Set(quote.toLowerCase().split(/\s+/));
        const existingWords = new Set(existing.toLowerCase().split(/\s+/));
        const intersection = new Set([...quoteWords].filter(x => existingWords.has(x)));
        const similarity = intersection.size / Math.max(quoteWords.size, existingWords.size);
        
        if (similarity > 0.5) {
          isDuplicate = true;
          break;
        }
      }
      
      if (!isDuplicate) {
        bullets.push(quote);
      }
    }
  }
  
  // If still no quotes, try to extract any meaningful sentences from the entire document
  if (bullets.length === 0) {
    const allQuotes = extractQuotes(text.substring(0, 10000), 60, 350);
    bullets.push(...allQuotes.slice(0, 5));
  }

  return NextResponse.json({
    bullets: bullets.slice(0, 5), // Ensure max 5 bullets
    source: '10-K Filing - Company Overview',
  });
}

