import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const searchInput = searchParams.get('company');

  if (!searchInput) {
    return NextResponse.json(
      { error: 'Company name or ticker symbol is required' },
      { status: 400 }
    );
  }

  try {
    // Known CIKs for common companies (to ensure we get the right parent company)
    const knownCompanies: { [key: string]: { cik: string; name: string; ticker: string } } = {
      'YETI': { cik: '0001670592', name: 'YETI Holdings, Inc.', ticker: 'YETI' },
      'yeti': { cik: '0001670592', name: 'YETI Holdings, Inc.', ticker: 'YETI' },
      'TSMC': { cik: '0001046179', name: 'Taiwan Semiconductor Manufacturing Company Limited', ticker: 'TSM' },
      'tsmc': { cik: '0001046179', name: 'Taiwan Semiconductor Manufacturing Company Limited', ticker: 'TSM' },
      'TAIWAN SEMICONDUCTOR': { cik: '0001046179', name: 'Taiwan Semiconductor Manufacturing Company Limited', ticker: 'TSM' },
      'taiwan semiconductor': { cik: '0001046179', name: 'Taiwan Semiconductor Manufacturing Company Limited', ticker: 'TSM' },
    };

    // Check if we have a known company first (case-insensitive)
    const searchKey = searchInput.trim().toUpperCase();
    // Also check for partial matches
    const searchKeyLower = searchInput.trim().toLowerCase();
    let cik: string | null = null;
    let companyNameFinal = searchInput;
    let ticker = '';
    let foundTicker = '';

    // Check exact match first, then partial match
    let knownCompany = knownCompanies[searchKey] || knownCompanies[searchKeyLower];
    
    // Also check for partial matches (e.g., "yeti holdings" should match "YETI")
    if (!knownCompany) {
      for (const [key, company] of Object.entries(knownCompanies)) {
        if (searchKey.includes(key.toUpperCase()) || searchKeyLower.includes(key.toLowerCase())) {
          knownCompany = company;
          break;
        }
      }
    }
    
    if (knownCompany) {
      cik = knownCompany.cik;
      companyNameFinal = knownCompany.name;
      ticker = knownCompany.ticker;
      foundTicker = knownCompany.ticker;
      console.log(`Using known company: ${knownCompany.name} (CIK: ${cik}, Ticker: ${ticker})`);
    }

    // Step 1: Determine if input is a ticker symbol or company name
    // Tickers are typically 1-5 uppercase alphanumeric characters
    const isTicker = /^[A-Z0-9]{1,5}$/i.test(searchInput.trim());
    const searchTerm = searchInput.trim().toUpperCase();

    // Step 2: Use SEC company ticker lookup API (only if we don't have a known company)
    // This API accepts both ticker symbols and company names
    if (!cik) {
      try {
      const tickerLookupUrl = `https://www.sec.gov/cgi-bin/cik_lookup`;
      
      // If it's a ticker, search by ticker; otherwise search by company name
      const searchField = isTicker ? 'ticker' : 'company';
      const searchValue = isTicker ? searchTerm : searchInput;
      
      const tickerResponse = await fetch(tickerLookupUrl, {
        method: 'POST',
        headers: {
          'User-Agent': 'YetiFinancialDashboard/1.0 (contact@example.com)',
          'Content-Type': 'application/x-www-form-urlencoded',
        },
        body: `${searchField}=${encodeURIComponent(searchValue)}`,
      });

      if (tickerResponse.ok) {
        const tickerHtml = await tickerResponse.text();
        
        // Parse the HTML table to find matching company
        // The table has rows with: CIK | Company Name | Ticker | Exchange
        const rows = tickerHtml.match(/<tr[^>]*>[\s\S]*?<\/tr>/gi) || [];
        
        // Collect all matching companies first, then select the best one
        interface CompanyMatch {
          cik: string;
          name: string;
          ticker: string;
          score: number;
        }
        const matches: CompanyMatch[] = [];
        
        for (const row of rows) {
          // Extract CIK from the row
          const cikMatch = row.match(/cik=(\d{10})/i) || row.match(/CIK[:\s]+(\d{10})/i);
          if (!cikMatch) continue;
          
          const rowCik = cikMatch[1].padStart(10, '0');
          
          // Extract ticker from the row
          const tickerMatch = row.match(/<td[^>]*>([A-Z0-9]{1,5})<\/td>/i);
          const rowTicker = tickerMatch ? tickerMatch[1].toUpperCase() : '';
          
          // Extract company name from the row
          const nameMatch = row.match(/<td[^>]*>([^<]+)<\/td>/gi);
          const rowName = nameMatch && nameMatch.length > 1 ? nameMatch[1].replace(/<[^>]*>/g, '').trim() : '';
          
          if (!rowName) continue;
          
          // If searching by ticker, match by ticker; otherwise match by name similarity
          if (isTicker) {
            if (rowTicker === searchTerm) {
              // Score companies to prioritize parent companies over subsidiaries
              let score = 0;
              const nameLower = rowName.toLowerCase();
              
              // Prefer companies with "Limited", "Inc", "Corporation" (parent companies)
              if (nameLower.includes('limited') || nameLower.includes('ltd')) score += 10;
              if (nameLower.includes('incorporated') || nameLower.includes(' inc')) score += 10;
              if (nameLower.includes('corporation') || nameLower.includes('corp')) score += 8;
              
              // Penalize subsidiaries (companies with location names or "Corp" without "Limited")
              if (nameLower.match(/\b(arizona|california|texas|florida|nevada|delaware|new york)\b/)) score -= 5;
              if (nameLower.includes('corp') && !nameLower.includes('limited') && !nameLower.includes('corporation')) score -= 3;
              
              // Special handling for TSMC - prefer "Taiwan Semiconductor" in name
              if (searchTerm === 'TSMC' && nameLower.includes('taiwan semiconductor')) score += 15;
              if (searchTerm === 'TSMC' && nameLower.includes('arizona')) score -= 10;
              
              // Prefer longer, more complete company names (parent companies)
              if (rowName.length > 30) score += 2;
              
              matches.push({
                cik: rowCik,
                name: rowName,
                ticker: rowTicker,
                score
              });
            }
          } else {
            // For company name search, use the first match or best match
            if (rowName.toLowerCase().includes(searchInput.toLowerCase()) || 
                searchInput.toLowerCase().includes(rowName.toLowerCase())) {
              let score = 0;
              const nameLower = rowName.toLowerCase();
              const searchLower = searchInput.toLowerCase();
              
              // Exact match gets highest score
              if (nameLower === searchLower) score += 20;
              
              // Prefer companies with "Limited", "Inc", "Corporation"
              if (nameLower.includes('limited') || nameLower.includes('ltd')) score += 10;
              if (nameLower.includes('incorporated') || nameLower.includes(' inc')) score += 10;
              
              matches.push({
                cik: rowCik,
                name: rowName,
                ticker: rowTicker,
                score
              });
              
              // If we found an exact name match, break
              if (nameLower === searchLower) {
                break;
              }
            }
          }
        }
        
        // Select the best match (highest score)
        if (matches.length > 0) {
          matches.sort((a, b) => b.score - a.score);
          const bestMatch = matches[0];
          cik = bestMatch.cik;
          foundTicker = bestMatch.ticker;
          companyNameFinal = bestMatch.name;
          
          console.log(`Found ${matches.length} matches for ${searchInput}, selected: ${bestMatch.name} (score: ${bestMatch.score})`);
        }
        
        // Fallback: if no structured match, try regex extraction
        if (!cik) {
          const cikMatch = tickerHtml.match(/cik=(\d{10})/i) || tickerHtml.match(/CIK[:\s]+(\d{10})/i);
          if (cikMatch) {
            cik = cikMatch[1].padStart(10, '0');
          }
        }
      }
      } catch (e) {
        console.log('Ticker lookup failed, trying browse-edgar method:', e);
      }

      // Step 3: If ticker lookup failed, try browse-edgar method
      if (!cik) {
      const searchUrl = `https://www.sec.gov/cgi-bin/browse-edgar?company=${encodeURIComponent(searchInput)}&owner=exclude&action=getcompany`;
      
      const searchResponse = await fetch(searchUrl, {
        headers: {
          'User-Agent': 'YetiFinancialDashboard/1.0 (contact@example.com)',
          'Accept': 'text/html',
        },
      });

      if (!searchResponse.ok) {
        throw new Error('Failed to search SEC database');
      }

      const searchHtml = await searchResponse.text();
      
      // Try multiple patterns to extract CIK
      let cikMatch = searchHtml.match(/cik=(\d{10})/i);
      
      if (!cikMatch) {
        // Try finding CIK in table rows or links
        cikMatch = searchHtml.match(/<a[^>]*href="[^"]*cik=(\d{10})[^"]*"[^>]*>/i);
      }
      
      if (!cikMatch) {
        // Try finding in the company information section
        cikMatch = searchHtml.match(/CIK[:\s]*(\d{10})/i);
      }
      
      if (!cikMatch) {
        // Try finding in data attributes or other patterns
        cikMatch = searchHtml.match(/data-cik="(\d{10})"/i) || searchHtml.match(/cik["\s:=]+(\d{10})/i);
      }
      
      if (cikMatch) {
        cik = cikMatch[1].padStart(10, '0');
      } else {
        // Last resort: try to find any 10-digit number that looks like a CIK
        const allCiks = searchHtml.match(/\b(\d{10})\b/g);
        if (allCiks && allCiks.length > 0) {
          // Use the first one that appears in a context suggesting it's a CIK
          cik = allCiks[0];
        }
      }
    }
    }

    if (!cik) {
      return NextResponse.json(
        { error: `Company or ticker "${searchInput}" not found in SEC database. Please try:\n- Using the exact company name as it appears in SEC filings\n- Using the company ticker symbol (e.g., YETI, TSM)\n- Checking the spelling` },
        { status: 404 }
      );
    }

    // Step 3: Fetch company information from SEC API
    const companyInfoUrl = `https://data.sec.gov/submissions/CIK${cik}.json`;
    const companyResponse = await fetch(companyInfoUrl, {
      headers: {
        'User-Agent': 'YetiFinancialDashboard/1.0 (contact@example.com)',
        'Accept': 'application/json',
      },
    });

    if (!companyResponse.ok) {
      if (companyResponse.status === 404) {
        return NextResponse.json(
          { error: `CIK ${cik} not found. The company may not be registered with the SEC.` },
          { status: 404 }
        );
      }
      throw new Error(`Failed to fetch company information: ${companyResponse.status}`);
    }

    const companyData = await companyResponse.json();
    companyNameFinal = companyData.name || companyNameFinal;
    ticker = companyData.ticker || foundTicker || '';
    
    // Verify ticker match if we searched by ticker
    if (isTicker && ticker && ticker.toUpperCase() !== searchTerm) {
      console.warn(`Ticker mismatch: searched for ${searchTerm}, found ${ticker}`);
      // Still proceed, but log the warning
    }

    // Step 4: Get filings (10-K, 10-Q, and 20-F for foreign companies)
    const filings = companyData.filings?.recent;
    
    if (!filings) {
      console.log(`No filings.recent found for ${companyNameFinal} (CIK: ${cik})`);
      console.log('Company data structure:', JSON.stringify(companyData, null, 2).substring(0, 500));
      return NextResponse.json({
        company: {
          cik,
          name: companyNameFinal,
          ticker,
        },
        filings: [],
      });
    }

    const forms = filings.form || [];
    const filingDates = filings.filingDate || [];
    const accessionNumbers = filings.accessionNumber || [];
    const primaryDocuments = filings.primaryDocument || [];
    const reportDates = filings.reportDate || [];

    // Debug: Log what we found
    console.log(`Found ${forms.length} total filings for ${companyNameFinal} (CIK: ${cik})`);
    const formCounts: { [key: string]: number } = {};
    forms.forEach((form: string) => {
      formCounts[form] = (formCounts[form] || 0) + 1;
    });
    console.log('Form types found:', formCounts);
    console.log('Sample filing data:', {
      forms: forms.slice(0, 5),
      filingDates: filingDates.slice(0, 5),
      accessionNumbers: accessionNumbers.slice(0, 5),
      primaryDocuments: primaryDocuments.slice(0, 5),
    });

    // Filter for 10-K, 10-Q, and 20-F (annual reports for foreign companies), last 8 years
    const currentYear = new Date().getFullYear();
    const cutoffYear = currentYear - 8;
    const filteredFilings: Array<{
      form: string;
      filingDate: string;
      reportDate: string;
      accessionNumber: string;
      documentUrl: string;
      documentName: string;
    }> = [];

    for (let i = 0; i < forms.length; i++) {
      const form = forms[i];
      // Include 10-K (US companies), 10-Q (quarterly), and 20-F (foreign companies annual)
      if (form === '10-K' || form === '10-Q' || form === '20-F') {
        const filingDate = filingDates[i];
        if (!filingDate) {
          console.warn(`Skipping filing ${i}: no filing date`);
          continue;
        }
        
        const filingYear = new Date(filingDate).getFullYear();
        
        if (filingYear >= cutoffYear) {
          const accessionNumber = accessionNumbers[i]?.replace(/-/g, '') || '';
          const primaryDoc = primaryDocuments[i] || '';
          const reportDate = reportDates[i] || filingDate;
          
          if (!accessionNumber || !primaryDoc) {
            console.warn(`Skipping filing ${i}: missing accession number (${accessionNumber}) or primary document (${primaryDoc})`);
            continue;
          }
          
          // Construct document URL
          // Format: https://www.sec.gov/Archives/edgar/data/{CIK}/{ACCESSION}/{PRIMARY_DOC}
          const documentUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${accessionNumber}/${primaryDoc}`;
          
          filteredFilings.push({
            form,
            filingDate,
            reportDate,
            accessionNumber: accessionNumbers[i],
            documentUrl,
            documentName: primaryDoc,
          });
        } else {
          console.log(`Skipping filing ${i} (${form}): year ${filingYear} is before cutoff ${cutoffYear}`);
        }
      }
    }

    console.log(`Filtered to ${filteredFilings.length} filings (10-K and 10-Q from last 8 years)`);

    // Sort by filing date (most recent first)
    filteredFilings.sort((a, b) => 
      new Date(b.filingDate).getTime() - new Date(a.filingDate).getTime()
    );

    return NextResponse.json({
      company: {
        cik,
        name: companyNameFinal,
        ticker,
      },
      filings: filteredFilings,
    });

  } catch (error: any) {
    console.error('Error fetching SEC filings:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch SEC filings. Please try again later.' },
      { status: 500 }
    );
  }
}

