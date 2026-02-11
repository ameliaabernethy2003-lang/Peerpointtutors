/**
 * SEC Filing Links Helper
 * 
 * This script provides direct links to Yeti Holdings SEC 10-K filings
 * Run with: node scripts/get-filing-links.js
 */

const CIK = '0001670592';

// Known filing accession numbers (you may need to update these)
const FILINGS = {
  2024: { accession: '0001670592-25-000008', filed: '2025-02-24' },
  2023: { accession: '0001670592-24-000007', filed: '2024-02-26' },
  2022: { accession: '0001670592-23-000006', filed: '2023-02-27' },
  2021: { accession: '0001670592-22-000009', filed: '2022-02-28' },
  2020: { accession: '0001670592-21-000010', filed: '2021-03-01' },
  2019: { accession: '0001670592-20-000011', filed: '2020-02-28' },
  2018: { accession: '0001670592-19-000012', filed: '2019-03-01' },
  2017: { accession: '0001670592-18-000013', filed: '2018-03-01' },
};

console.log('Yeti Holdings Inc. (YETI) - SEC 10-K Filing Links\n');
console.log('CIK: 0001670592\n');
console.log('Direct Links to Filing Index Pages:\n');

Object.keys(FILINGS).sort().reverse().forEach(year => {
  const filing = FILINGS[year];
  const indexUrl = `https://www.sec.gov/Archives/edgar/data/${CIK}/${filing.accession}-index.htm`;
  console.log(`${year}: ${indexUrl}`);
});

console.log('\nInstructions:');
console.log('1. Click each link above to open the filing index page');
console.log('2. Click "Documents" button');
console.log('3. Find and click "10-K" or "Annual report [Section 13 and 15(d)]"');
console.log('4. Navigate to "Item 8. Financial Statements and Supplementary Data"');
console.log('5. Extract exact values from:');
console.log('   - Consolidated Statements of Operations');
console.log('   - Consolidated Balance Sheets');
console.log('   - Consolidated Statements of Cash Flows');
console.log('6. Update src/app/components/operatingModelData.ts with exact values\n');

console.log('Alternative: Visit https://www.sec.gov/edgar/browse/?CIK=1670592&owner=exclude');
console.log('and filter for "10-K" filings.\n');

