# Google Cloud Console - Step-by-Step Instructions

## 🎯 Step 1: Create a Project

### Once you're at console.cloud.google.com:

1. **Look at the top bar** - You'll see a project dropdown (it might say "Select a project" or show a project name)

2. **Click the project dropdown** (top left, next to "Google Cloud")

3. **Click "New Project"** button (top right of the dropdown)

4. **Fill in the form:**
   - **Project name**: Type `peerpoint-calendar` (or any name you prefer)
   - **Organization**: Leave as default (if shown)
   - **Location**: Leave as default (if shown)

5. **Click "CREATE"** button (blue button, bottom right)

6. **Wait 10-30 seconds** - You'll see "Creating project..." notification

7. **Select your new project:**
   - Click the project dropdown again
   - Click on `peerpoint-calendar` (or whatever you named it)
   - The page will refresh with your project selected

---

## 🎯 Step 2: Enable Google Calendar API

### Now that you have a project selected:

1. **Look at the left sidebar** - You'll see a menu with options

2. **Click "APIs & Services"** (it has an icon that looks like a puzzle piece or API symbol)

3. **Click "Library"** (under "APIs & Services" in the left sidebar, or you might see it as a tab)

4. **In the search bar at the top**, type: `Google Calendar API`

5. **Click on "Google Calendar API"** (it should be the first result, with a calendar icon)

6. **Click the blue "ENABLE" button** (top of the page, large blue button)

7. **Wait a few seconds** - You'll see "API enabled" confirmation message

8. **You're done with this step!** You can click "Go to APIs overview" or just continue

---

## 🎯 Step 3: Create Service Account

### Still in the same project:

1. **In the left sidebar**, click **"APIs & Services"** again

2. **Click "Credentials"** (under "APIs & Services" in the left sidebar)

3. **At the top of the page**, you'll see a blue button **"+ CREATE CREDENTIALS"**

4. **Click "+ CREATE CREDENTIALS"**

5. **A dropdown menu appears** - Click **"Service account"**

6. **Fill in the form that appears:**
   - **Service account name**: Type `peerpoint-calendar-service`
   - **Service account ID**: (This auto-fills based on the name, leave it as is)
   - **Description**: Type `Service account for canceling calendar events`

7. **Click "CREATE AND CONTINUE"** (blue button, bottom right)

8. **Skip the next step** - You'll see "Grant this service account access to project"
   - Click **"CONTINUE"** (or "SKIP") at the bottom

9. **Skip the next step** - You'll see "Grant users access to this service account"
   - Click **"DONE"** (blue button, bottom right)

10. **You'll see a list of service accounts** - Your new one should be at the top!

---

## 🎯 Step 4: Download JSON Key

### You should see your service account in the list:

1. **Click on the service account email** (it will look like: `peerpoint-calendar-service@your-project-number.iam.gserviceaccount.com`)

2. **Click the "KEYS" tab** at the top of the page (next to "DETAILS")

3. **Click "ADD KEY"** button (top of the page)

4. **Click "Create new key"** from the dropdown

5. **A popup appears** - Select **"JSON"** radio button

6. **Click "CREATE"** button (blue button, bottom right)

7. **A JSON file downloads automatically!** 
   - Check your Downloads folder
   - The file will be named something like: `peerpoint-calendar-service-abc123-def456.json`
   - **Note the file path!**

---

## ✅ You're Done with Google Cloud Console!

### Next Steps:

1. **Tell me the path to your JSON file**, OR
2. **Run this command:**
   ```bash
   npm run format-credentials <path-to-json-file>
   ```

**Example:**
```bash
npm run format-credentials ~/Downloads/peerpoint-calendar-service-abc123.json
```

I'll format everything and show you the service account email to share calendars with!

---

## 🆘 Troubleshooting

**Can't find "APIs & Services"?**
- Look for "☰" (hamburger menu) in the top left
- Click it to expand the sidebar

**Project dropdown not showing?**
- Make sure you're signed in
- Try refreshing the page

**JSON file didn't download?**
- Check your browser's download settings
- Look in your Downloads folder
- Try clicking "ADD KEY" → "Create new key" → "JSON" again
