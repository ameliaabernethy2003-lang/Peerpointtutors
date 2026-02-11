# SEC Data Extraction Scripts

## extract-sec-data.js

This script attempts to fetch SEC 10-K filings and extract Item 8 financial statements.

### Usage

```bash
node scripts/extract-sec-data.js
```

### What it does

1. Fetches SEC filing index pages for years 2017-2024
2. Locates 10-K filings for Yeti Holdings (CIK: 0001670592)
3. Extracts Item 8 content from each filing
4. Saves Item 8 HTML to `extracted-data/item8-YYYY.html`

### Limitations

- SEC website structure may change, requiring script updates
- HTML parsing of financial tables is complex and may need manual review
- Rate limiting: Script includes delays to respect SEC servers

### Manual Extraction Alternative

If the script doesn't work perfectly, you can:

1. Visit: https://www.sec.gov/edgar/browse/?CIK=1670592&owner=exclude
2. For each year, click on the 10-K filing
3. Click "Documents" → Find "10-K" or "Annual report [Section 13 and 15(d)]"
4. Open the document and navigate to Item 8
5. Copy exact values from the financial statements
6. Update the data files manually

### Next Steps

After running the script:
1. Review the extracted HTML files in `extracted-data/`
2. Manually extract financial values from Item 8
3. Update `src/app/components/operatingModelData.ts` and `src/app/components/financialData.ts`

