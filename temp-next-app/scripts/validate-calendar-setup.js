/**
 * Validation script for Google Calendar API setup
 * Run with: node scripts/validate-calendar-setup.js
 * 
 * Note: This script reads from .env.local file
 * Make sure you have created .env.local with your credentials
 */

// Try to load dotenv if available, otherwise read .env.local manually
try {
  require('dotenv').config({ path: '.env.local' });
} catch (e) {
  // If dotenv not installed, try reading .env.local manually
  const fs = require('fs');
  const path = require('path');
  
  try {
    const envPath = path.join(__dirname, '..', '.env.local');
    if (fs.existsSync(envPath)) {
      const envContent = fs.readFileSync(envPath, 'utf-8');
      envContent.split('\n').forEach(line => {
        const [key, ...valueParts] = line.split('=');
        if (key && valueParts.length > 0) {
          const value = valueParts.join('=').trim().replace(/^["']|["']$/g, '');
          process.env[key.trim()] = value;
        }
      });
    }
  } catch (err) {
    console.log('⚠️  Could not load .env.local automatically');
    console.log('   Make sure your environment variables are set\n');
  }
}

const { google } = require('googleapis');

function validateSetup() {
  console.log('🔍 Validating Google Calendar API Setup...\n');

  // Check environment variables
  const serviceAccountEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  const privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (!serviceAccountEmail) {
    console.error('❌ GOOGLE_SERVICE_ACCOUNT_EMAIL is not set');
    console.log('   Add it to your .env.local file');
    return false;
  }

  if (!privateKey) {
    console.error('❌ GOOGLE_PRIVATE_KEY is not set');
    console.log('   Add it to your .env.local file');
    return false;
  }

  console.log('✅ Environment variables found');
  console.log(`   Service Account: ${serviceAccountEmail}\n`);

  // Try to initialize the client
  try {
    const formattedKey = privateKey.replace(/\\n/g, '\n');
    
    const auth = new google.auth.JWT({
      email: serviceAccountEmail,
      key: formattedKey,
      scopes: ['https://www.googleapis.com/auth/calendar'],
    });

    console.log('✅ Google Calendar client initialized successfully');
    console.log('✅ Setup appears to be correct!\n');
    
    console.log('📝 Next steps:');
    console.log('   1. Make sure you\'ve shared calendars with the service account');
    console.log('   2. Test by rejecting a booking from the admin panel');
    console.log('   3. Check that calendar events are canceled\n');

    return true;
  } catch (error) {
    console.error('❌ Error initializing Google Calendar client:');
    console.error(`   ${error.message}\n`);
    
    if (error.message.includes('private key')) {
      console.log('💡 Tip: Make sure your GOOGLE_PRIVATE_KEY includes:');
      console.log('   - The BEGIN and END markers');
      console.log('   - Newlines are escaped as \\n');
      console.log('   - The entire key is in quotes\n');
    }
    
    return false;
  }
}

// Run validation
if (require.main === module) {
  const isValid = validateSetup();
  process.exit(isValid ? 0 : 1);
}

module.exports = { validateSetup };
