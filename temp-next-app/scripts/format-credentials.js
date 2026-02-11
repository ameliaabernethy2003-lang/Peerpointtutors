#!/usr/bin/env node

/**
 * Helper script to format Google Calendar API credentials
 * Usage: node scripts/format-credentials.js <path-to-json-file>
 */

const fs = require('fs');
const path = require('path');

const jsonFilePath = process.argv[2];

if (!jsonFilePath) {
  console.error('❌ Please provide the path to your service account JSON file');
  console.log('\nUsage: node scripts/format-credentials.js <path-to-json-file>');
  console.log('Example: node scripts/format-credentials.js ~/Downloads/peerpoint-calendar-service.json\n');
  process.exit(1);
}

if (!fs.existsSync(jsonFilePath)) {
  console.error(`❌ File not found: ${jsonFilePath}`);
  process.exit(1);
}

try {
  // Read and parse JSON
  const jsonContent = fs.readFileSync(jsonFilePath, 'utf-8');
  const jsonData = JSON.parse(jsonContent);

  const serviceAccountEmail = jsonData.client_email;
  const privateKey = jsonData.private_key;

  if (!serviceAccountEmail || !privateKey) {
    console.error('❌ Invalid JSON file. Missing client_email or private_key.');
    process.exit(1);
  }

  console.log('\n✅ Credentials extracted successfully!\n');
  console.log(`Service Account Email: ${serviceAccountEmail}\n`);

  // Format private key for .env.local (escape newlines)
  const formattedKey = privateKey.replace(/\n/g, '\\n');

  // Create .env.local file
  const envPath = path.join(__dirname, '..', '.env.local');
  const envContent = `# Google Calendar API Configuration
# Generated on ${new Date().toISOString()}

GOOGLE_SERVICE_ACCOUNT_EMAIL=${serviceAccountEmail}
GOOGLE_PRIVATE_KEY="${formattedKey}"
`;

  fs.writeFileSync(envPath, envContent);

  console.log('✅ Created .env.local file!\n');
  console.log('📋 Next Steps:\n');
  console.log('1. Share calendars with the service account:');
  console.log(`   Email: ${serviceAccountEmail}`);
  console.log('   Permission: "Make changes to events"\n');
  console.log('2. For each tutor\'s Google Calendar:');
  console.log('   - Go to Settings > Settings for my calendars');
  console.log('   - Select the calendar used for appointments');
  console.log('   - Click "Share with specific people"');
  console.log(`   - Add: ${serviceAccountEmail}`);
  console.log('   - Permission: "Make changes to events"\n');
  console.log('3. Restart your dev server: npm run dev\n');
  console.log('4. Test by rejecting a booking from admin panel\n');

  // Try to validate
  console.log('🔍 Validating setup...\n');
  try {
    const { validateSetup } = require('./validate-calendar-setup.js');
    validateSetup();
  } catch (error) {
    console.log('⚠️  Could not run validation automatically');
    console.log('   Run manually with: npm run validate-calendar\n');
  }

} catch (error) {
  console.error('❌ Error:', error.message);
  process.exit(1);
}
