import { NextRequest, NextResponse } from 'next/server';

interface FinancialStatement {
  incomeStatement: any[];
  balanceSheet: any[];
  cashFlowStatement: any[];
}

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
      throw new Error(`Failed to fetch company information: ${companyResponse.status}`);
    }

    const companyData = await companyResponse.json();
    
    // Get 10-K filings for the last 6 full years
    const filings = companyData.filings?.recent || {};
    const forms = filings.form || [];
    const accessionNumbers = filings.accessionNumber || [];
    const filingDates = filings.filingDate || [];
    
    const currentYear = new Date().getFullYear();
    const targetYears: number[] = [];
    for (let i = 0; i < 6; i++) {
      targetYears.push(currentYear - i);
    }
    
    // Find 10-K filings for each target year
    const yearFilings: Map<number, { accession: string; date: string }> = new Map();
    
    for (let i = 0; i < forms.length; i++) {
      if (forms[i] === '10-K' || forms[i] === '20-F') {
        const filingDate = filingDates[i];
        const filingYear = new Date(filingDate).getFullYear();
        
        if (targetYears.includes(filingYear) && !yearFilings.has(filingYear)) {
          yearFilings.set(filingYear, {
            accession: accessionNumbers[i],
            date: filingDate,
          });
        }
      }
    }
    
    if (yearFilings.size === 0) {
      return NextResponse.json(
        { error: 'No 10-K filings found for the last 6 years' },
        { status: 404 }
      );
    }
    
    // Fetch and parse each 10-K filing
    const financialData: Map<number, FinancialStatement> = new Map();
    const errors: string[] = [];
    
    for (const [year, filing] of yearFilings.entries()) {
      try {
        const statements = await extractFinancialStatements(paddedCik, filing.accession, year);
        if (statements) {
          // Check if we got at least some data
          const hasData = statements.incomeStatement.length > 0 || 
                         statements.balanceSheet.length > 0 || 
                         statements.cashFlowStatement.length > 0;
          
          if (hasData) {
            financialData.set(year, statements);
          } else {
            errors.push(`${year}: No financial data found in filing`);
          }
        } else {
          errors.push(`${year}: Failed to extract statements from filing`);
        }
      } catch (error: any) {
        console.error(`Error extracting data for ${year}:`, error);
        errors.push(`${year}: ${error.message || 'Unknown error'}`);
        // Continue with other years
      }
    }
    
    if (financialData.size === 0) {
      const errorMessage = errors.length > 0 
        ? `Failed to extract financial statements. Errors: ${errors.join('; ')}`
        : 'Failed to extract financial statements from 10-K filings. The filings may not be in the expected format.';
      
      return NextResponse.json(
        { error: errorMessage, details: errors },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      financialData: Object.fromEntries(financialData),
      years: Array.from(financialData.keys()).sort((a, b) => a - b),
    });
    
  } catch (error: any) {
    console.error('Error fetching operating model data:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to fetch operating model data' },
      { status: 500 }
    );
  }
}

async function extractFinancialStatements(
  cik: string,
  accessionNumber: string,
  year: number
): Promise<FinancialStatement | null> {
  try {
    const accession = accessionNumber.replace(/-/g, '');
    const indexUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${accession}/${accessionNumber}-index.htm`;
    
    // Fetch filing index
    const indexResponse = await fetch(indexUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    });
    
    if (!indexResponse.ok) {
      return null;
    }
    
    const indexHtml = await indexResponse.text();
    
    // Find the main 10-K document (avoid XBRL viewer)
    let docUrl = '';
    const tableRowMatches = indexHtml.matchAll(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
    for (const rowMatch of tableRowMatches) {
      const row = rowMatch[0];
      if (/10-?K|Annual|annual/i.test(row) && !/xbrl|viewer|interactive/i.test(row)) {
        const hrefMatch = row.match(/href=["']([^"']*\.(?:htm|html))["']/i);
        if (hrefMatch && !hrefMatch[1].toLowerCase().includes('xbrl')) {
          const docPath = hrefMatch[1];
          if (docPath.startsWith('http')) {
            docUrl = docPath;
          } else if (docPath.startsWith('/')) {
            docUrl = `https://www.sec.gov${docPath}`;
          } else {
            docUrl = `https://www.sec.gov/Archives/edgar/data/${cik}/${accession}/${docPath}`;
          }
          break;
        }
      }
    }
    
    if (!docUrl) {
      return null;
    }
    
    // Fetch the 10-K document
    const docResponse = await fetch(docUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
        'Accept': 'text/html',
      },
    });
    
    if (!docResponse.ok) {
      return null;
    }
    
    let docHtml = await docResponse.text();
    
    // Check if it's an XBRL viewer page or if HTML is too short
    if (docHtml.includes('enable JavaScript') || docHtml.includes('XBRL Viewer') || docHtml.length < 10000) {
      // Try text version - often easier to parse
      const textUrl = docUrl.replace(/\.(htm|html)$/i, '.txt');
      try {
        const textResponse = await fetch(textUrl, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36',
            'Accept': 'text/plain',
          },
        });
        if (textResponse.ok) {
          const textContent = await textResponse.text();
          if (textContent.length > docHtml.length) {
            docHtml = textContent;
          }
        }
      } catch (e) {
        // Continue with HTML
      }
    }
    
    // If document is still too short, it might not be the right document
    if (docHtml.length < 5000) {
      console.error(`Document too short for ${year}: ${docHtml.length} characters`);
      return null;
    }
    
    // Extract Item 8 section - try multiple patterns
    let item8Html = '';
    
    // Pattern 1: Look for "Item 8" or "ITEM 8" followed by financial statements
    const item8Patterns = [
      /(?:item\s+8|item\s+8\.|ITEM\s+8)[\s\S]{0,1000}(?:financial|statements|Financial|Statements)[\s\S]*?(?=item\s+9|item\s+10|ITEM\s+9|ITEM\s+10|part\s+iii|PART\s+III)/i,
      /(?:item\s+8|ITEM\s+8)[\s\S]{0,50000}/i,
      /(?:part\s+ii|PART\s+II)[\s\S]{0,2000}(?:item\s+8|ITEM\s+8)[\s\S]{0,50000}/i,
    ];
    
    for (const pattern of item8Patterns) {
      const match = docHtml.match(pattern);
      if (match && match[0].length > 5000) {
        item8Html = match[0];
        break;
      }
    }
    
    // If Item 8 not found, search for financial statements directly
    if (!item8Html || item8Html.length < 5000) {
      // Try to find financial statements anywhere in the document
      const statementPatterns = [
        /(?:consolidated\s+statements?\s+of\s+(?:operations|income|comprehensive\s+income))[\s\S]{0,50000}/i,
        /(?:consolidated\s+statements?\s+of\s+(?:financial\s+position|balance\s+sheets?))[\s\S]{0,50000}/i,
        /(?:consolidated\s+statements?\s+of\s+cash\s+flows?)[\s\S]{0,50000}/i,
      ];
      
      for (const pattern of statementPatterns) {
        const match = docHtml.match(pattern);
        if (match && match[0].length > 1000) {
          if (!item8Html) {
            item8Html = match[0];
          } else {
            item8Html += '\n' + match[0];
          }
        }
      }
    }
    
    // If still no content, use the entire document (last resort)
    if (!item8Html || item8Html.length < 1000) {
      item8Html = docHtml;
    }
    
    // Parse financial statements
    const incomeStatement = parseIncomeStatement(item8Html);
    const balanceSheet = parseBalanceSheet(item8Html);
    const cashFlowStatement = parseCashFlowStatement(item8Html);
    
    // If we got at least one statement, return it
    if (incomeStatement.length > 0 || balanceSheet.length > 0 || cashFlowStatement.length > 0) {
      return {
        incomeStatement,
        balanceSheet,
        cashFlowStatement,
      };
    }
    
    // If no statements found, return null
    return null;
    
  } catch (error) {
    console.error(`Error extracting financial statements for ${year}:`, error);
    return null;
  }
}

function parseIncomeStatement(html: string): any[] {
  // Find income statement section - try multiple approaches
  let tableHtml = '';
  
  // Approach 1: Look for table containing income statement keywords
  const incomeKeywords = [
    'consolidated statements of operations',
    'consolidated statements of income',
    'consolidated statements of comprehensive income',
    'statements of operations',
    'income statement',
    'statement of income',
  ];
  
  for (const keyword of incomeKeywords) {
    const pattern = new RegExp(`<table[^>]*>[\\s\\S]*?${keyword.replace(/\s+/g, '[\\s\\S]{0,50}')}[\\s\\S]{0,50000}?</table>`, 'i');
    const match = html.match(pattern);
    if (match && match[0].length > 1000) {
      tableHtml = match[0];
      break;
    }
  }
  
  // Approach 2: Find table near income statement text
  if (!tableHtml) {
    for (const keyword of incomeKeywords) {
      const textMatch = html.match(new RegExp(keyword, 'i'));
      if (textMatch) {
        const startIndex = textMatch.index || 0;
        const section = html.substring(Math.max(0, startIndex - 500), startIndex + 50000);
        const tableMatch = section.match(/<table[^>]*>[\s\S]{0,50000}?<\/table>/i);
        if (tableMatch) {
          tableHtml = tableMatch[0];
          break;
        }
      }
    }
  }
  
  // Approach 3: Find any large table and check if it contains income statement items
  if (!tableHtml) {
    const allTables = html.matchAll(/<table[^>]*>[\s\S]{0,50000}?<\/table>/gi);
    for (const tableMatch of allTables) {
      const table = tableMatch[0];
      // Check if table contains income statement line items
      if (table.length > 2000 && (
        /revenue|net sales|cost of|gross profit|operating income|net income/i.test(table)
      )) {
        tableHtml = table;
        break;
      }
    }
  }
  
  // Approach 4: For text files, parse line by line
  if (!tableHtml || tableHtml.length < 500) {
    // Check if this is a text file (no HTML tags)
    if (!html.includes('<table') && !html.includes('<TABLE')) {
      return parseTextFormat(html, 'income');
    }
    return [];
  }
  
  // Use shared table parsing function
  return parseTableRows(tableHtml);
}

// Parse text format filings (often easier than HTML)
function parseTextFormat(text: string, statementType: 'income' | 'balance' | 'cashflow'): any[] {
  const rows: any[] = [];
  const lines = text.split('\n');
  
  // Find the statement section
  let inStatement = false;
  let headerFound = false;
  let yearColumns: number[] = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();
    
    // Detect statement start
    if (!inStatement) {
      const statementKeywords = statementType === 'income' 
        ? ['consolidated statements of operations', 'consolidated statements of income', 'income statement']
        : statementType === 'balance'
        ? ['consolidated balance sheets', 'consolidated statements of financial position', 'balance sheet']
        : ['consolidated statements of cash flows', 'statement of cash flows'];
      
      for (const keyword of statementKeywords) {
        if (line.toLowerCase().includes(keyword)) {
          inStatement = true;
          break;
        }
      }
      continue;
    }
    
    // Skip until we find the header row with years
    if (!headerFound) {
      // Look for year patterns (e.g., "2024", "2023", "2022", etc.)
      const yearMatches = line.match(/\b(20\d{2})\b/g);
      if (yearMatches && yearMatches.length >= 2) {
        yearColumns = yearMatches.map(y => parseInt(y));
        headerFound = true;
        continue;
      }
    }
    
    // Parse data rows
    if (headerFound && line.length > 10) {
      // Skip separator lines
      if (/^[-=\s]+$/.test(line)) continue;
      
      // Try to extract label and values
      // Format is typically: "Label" followed by numbers
      const parts = line.split(/\s{2,}|\t/).filter(p => p.trim().length > 0);
      
      if (parts.length > 1) {
        const label = parts[0].trim();
        const values = parts.slice(1);
        
        // Only process if label contains letters (not just numbers)
        if (label && /[a-zA-Z]/.test(label) && label.length > 3) {
          const parsedValues: (number | string)[] = yearColumns.map((year, idx) => {
            if (idx < values.length) {
              const val = values[idx].trim()
                .replace(/,/g, '')
                .replace(/\$/g, '')
                .replace(/[()]/g, (match, offset) => offset === 0 ? '-' : '');
              
              const num = parseFloat(val);
              return !isNaN(num) ? num : '';
            }
            return '';
          });
          
          rows.push({
            Item: label,
            values: parsedValues,
          });
        }
      }
      
      // Stop if we hit another major section
      if (line.toLowerCase().includes('notes to') || 
          line.toLowerCase().includes('see accompanying')) {
        break;
      }
    }
  }
  
  return rows;
}

function parseBalanceSheet(html: string): any[] {
  // Find balance sheet section - try multiple approaches
  let tableHtml = '';
  
  const balanceKeywords = [
    'consolidated statements of financial position',
    'consolidated balance sheets',
    'consolidated balance sheet',
    'statements of financial position',
    'balance sheet',
  ];
  
  for (const keyword of balanceKeywords) {
    const pattern = new RegExp(`<table[^>]*>[\\s\\S]*?${keyword.replace(/\s+/g, '[\\s\\S]{0,50}')}[\\s\\S]{0,50000}?</table>`, 'i');
    const match = html.match(pattern);
    if (match && match[0].length > 1000) {
      tableHtml = match[0];
      break;
    }
  }
  
  if (!tableHtml) {
    for (const keyword of balanceKeywords) {
      const textMatch = html.match(new RegExp(keyword, 'i'));
      if (textMatch) {
        const startIndex = textMatch.index || 0;
        const section = html.substring(Math.max(0, startIndex - 500), startIndex + 50000);
        const tableMatch = section.match(/<table[^>]*>[\s\S]{0,50000}?<\/table>/i);
        if (tableMatch) {
          tableHtml = tableMatch[0];
          break;
        }
      }
    }
  }
  
  if (!tableHtml) {
    const allTables = html.matchAll(/<table[^>]*>[\s\S]{0,50000}?<\/table>/gi);
    for (const tableMatch of allTables) {
      const table = tableMatch[0];
      if (table.length > 2000 && (
        /assets|liabilities|stockholders|equity|current assets|current liabilities/i.test(table)
      )) {
        tableHtml = table;
        break;
      }
    }
  }
  
  if (!tableHtml || tableHtml.length < 500) {
    // Try text format parsing
    if (!html.includes('<table') && !html.includes('<TABLE')) {
      return parseTextFormat(html, 'balance');
    }
    return [];
  }
  
  // Use the same robust parsing logic as income statement
  return parseTableRows(tableHtml);
}

function parseCashFlowStatement(html: string): any[] {
  // Find cash flow statement section - try multiple approaches
  let tableHtml = '';
  
  const cashFlowKeywords = [
    'consolidated statements of cash flows',
    'consolidated statement of cash flows',
    'statements of cash flows',
    'statement of cash flows',
    'cash flows',
  ];
  
  for (const keyword of cashFlowKeywords) {
    const pattern = new RegExp(`<table[^>]*>[\\s\\S]*?${keyword.replace(/\s+/g, '[\\s\\S]{0,50}')}[\\s\\S]{0,50000}?</table>`, 'i');
    const match = html.match(pattern);
    if (match && match[0].length > 1000) {
      tableHtml = match[0];
      break;
    }
  }
  
  if (!tableHtml) {
    for (const keyword of cashFlowKeywords) {
      const textMatch = html.match(new RegExp(keyword, 'i'));
      if (textMatch) {
        const startIndex = textMatch.index || 0;
        const section = html.substring(Math.max(0, startIndex - 500), startIndex + 50000);
        const tableMatch = section.match(/<table[^>]*>[\s\S]{0,50000}?<\/table>/i);
        if (tableMatch) {
          tableHtml = tableMatch[0];
          break;
        }
      }
    }
  }
  
  if (!tableHtml) {
    const allTables = html.matchAll(/<table[^>]*>[\s\S]{0,50000}?<\/table>/gi);
    for (const tableMatch of allTables) {
      const table = tableMatch[0];
      if (table.length > 2000 && (
        /operating activities|investing activities|financing activities|cash and cash equivalents/i.test(table)
      )) {
        tableHtml = table;
        break;
      }
    }
  }
  
  if (!tableHtml || tableHtml.length < 500) {
    // Try text format parsing
    if (!html.includes('<table') && !html.includes('<TABLE')) {
      return parseTextFormat(html, 'cashflow');
    }
    return [];
  }
  
  // Use the same robust parsing logic as income statement
  return parseTableRows(tableHtml);
}

// Shared table parsing function
function parseTableRows(tableHtml: string): any[] {
  const rows: any[] = [];
  
  // Try multiple cell matching patterns
  const cellPatterns = [
    /<t[dh][^>]*>([\s\S]*?)<\/t[dh]>/gi,
    /<td[^>]*>([\s\S]*?)<\/td>/gi,
    /<th[^>]*>([\s\S]*?)<\/th>/gi,
  ];
  
  const rowMatches = tableHtml.matchAll(/<tr[^>]*>[\s\S]*?<\/tr>/gi);
  
  for (const rowMatch of rowMatches) {
    const row = rowMatch[0];
    let cellValues: string[] = [];
    
    // Try each cell pattern
    for (const pattern of cellPatterns) {
      const cells = row.matchAll(pattern);
      const tempCells: string[] = [];
      
      for (const cellMatch of cells) {
        let cellText = cellMatch[1]
          .replace(/<[^>]*>/g, ' ')
          .replace(/&nbsp;/g, ' ')
          .replace(/&amp;/g, '&')
          .replace(/&lt;/g, '<')
          .replace(/&gt;/g, '>')
          .replace(/\s+/g, ' ')
          .trim();
        
        if (cellText && cellText.length > 0 && cellText.trim().length > 0) {
          tempCells.push(cellText);
        }
      }
      
      if (tempCells.length > 1) {
        cellValues = tempCells;
        break;
      }
    }
    
    if (cellValues.length > 1) {
      const label = cellValues[0];
      const values = cellValues.slice(1);
      
      // Parse numbers from values - handle various formats
      const parsedValues: (number | string)[] = values.map(val => {
        if (!val || val.trim().length === 0) {
          return '';
        }
        
        // Remove common formatting characters but preserve structure
        let cleaned = val
          .replace(/,/g, '')  // Remove commas
          .replace(/\$/g, '')  // Remove dollar signs
          .replace(/\s+/g, '') // Remove spaces
          .trim();
        
        // Check if it's negative (parentheses indicate negative in accounting)
        const isNegative = val.includes('(') || cleaned.startsWith('-');
        
        // Remove parentheses
        cleaned = cleaned.replace(/[()]/g, '');
        
        // Try to parse as number
        const num = parseFloat(cleaned);
        
        if (!isNaN(num) && isFinite(num)) {
          return isNegative ? -Math.abs(num) : num;
        }
        
        // If not a number, return empty string
        return '';
      });
      
      // Only add row if label is meaningful (not just whitespace or numbers)
      if (label && label.trim().length > 0 && /[a-zA-Z]/.test(label)) {
        rows.push({
          Item: label.trim(),
          values: parsedValues,
        });
      }
    }
  }
  
  return rows;
}

