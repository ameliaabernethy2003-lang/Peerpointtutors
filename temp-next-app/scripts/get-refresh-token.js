/**
 * Helper script to obtain a Google OAuth2 refresh token
 * Run this script to get a refresh token for peerpointtutors@gmail.com
 * 
 * Usage:
 *   1. Set CLIENT_ID and CLIENT_SECRET below
 *   2. Run: node scripts/get-refresh-token.js
 *   3. Follow the instructions
 */

const { google } = require('googleapis');
const readline = require('readline');

// Replace these with your OAuth2 credentials from Google Cloud Console
const CLIENT_ID = process.env.GOOGLE_CLIENT_ID || 'YOUR_CLIENT_ID_HERE';
const CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET || 'YOUR_CLIENT_SECRET_HERE';
const REDIRECT_URI = 'http://localhost:3000/api/auth/callback';

if (CLIENT_ID === 'YOUR_CLIENT_ID_HERE' || CLIENT_SECRET === 'YOUR_CLIENT_SECRET_HERE') {
  console.error('❌ Error: Please set CLIENT_ID and CLIENT_SECRET');
  console.log('\nYou can either:');
  console.log('1. Set them as environment variables:');
  console.log('   export GOOGLE_CLIENT_ID=your_client_id');
  console.log('   export GOOGLE_CLIENT_SECRET=your_client_secret');
  console.log('2. Or edit this file and replace YOUR_CLIENT_ID_HERE and YOUR_CLIENT_SECRET_HERE');
  process.exit(1);
}

const oauth2Client = new google.auth.OAuth2(
  CLIENT_ID,
  CLIENT_SECRET,
  REDIRECT_URI
);

const scopes = ['https://www.googleapis.com/auth/calendar'];

const authUrl = oauth2Client.generateAuthUrl({
  access_type: 'offline',
  scope: scopes,
  prompt: 'consent', // Force consent screen to get refresh token
});

console.log('\n🔐 Google OAuth2 Refresh Token Generator\n');
console.log('📋 Step 1: Authorize this app');
console.log('   Visit this URL in your browser:');
console.log(`   ${authUrl}\n`);
console.log('📋 Step 2: Sign in with peerpointtutors@gmail.com');
console.log('📋 Step 3: Click "Allow" to grant permissions');
console.log('📋 Step 4: Copy the authorization code from the redirect URL\n');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.question('Enter the authorization code here: ', (code) => {
  rl.close();
  
  oauth2Client.getToken(code, (err, token) => {
    if (err) {
      console.error('❌ Error retrieving access token:', err.message);
      if (err.message.includes('invalid_grant')) {
        console.log('\n💡 Tip: The authorization code may have expired. Please try again.');
      }
      process.exit(1);
    }
    
    if (!token.refresh_token) {
      console.error('❌ Error: No refresh token received');
      console.log('\n💡 Tip: Make sure you selected "offline" access and signed in with peerpointtutors@gmail.com');
      console.log('   Try running this script again and make sure to grant all permissions.');
      process.exit(1);
    }
    
    console.log('\n✅ Success! Refresh token obtained.\n');
    console.log('📝 Add these to your .env.local file:\n');
    console.log(`GOOGLE_CLIENT_ID=${CLIENT_ID}`);
    console.log(`GOOGLE_CLIENT_SECRET=${CLIENT_SECRET}`);
    console.log(`GOOGLE_REFRESH_TOKEN=${token.refresh_token}`);
    console.log(`GOOGLE_REDIRECT_URI=${REDIRECT_URI}`);
    console.log('\n⚠️  Keep these credentials secure and never commit them to version control!\n');
  });
});
