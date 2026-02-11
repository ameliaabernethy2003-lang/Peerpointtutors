# How to Find Service Account Email and Keys Tab

## 🎯 Step 1: Find Your Service Account

After creating the service account, you should see a **list of service accounts** on the page.

### What to Look For:

1. **You'll see a table or list** with columns like:
   - **Email** (this is what you need!)
   - Name
   - Created
   - etc.

2. **Find the email** that looks like:
   ```
   peerpoint-calendar-service@your-project-number.iam.gserviceaccount.com
   ```
   (It will have your project ID in it)

3. **Click directly on the EMAIL** (the blue clickable link)

---

## 🎯 Step 2: Find the Keys Tab

After clicking the service account email, you'll be taken to a **details page**.

### What You'll See:

At the **TOP of the page**, you'll see tabs like:
- **DETAILS** ← (you might be on this tab)
- **KEYS** ← **CLICK THIS ONE!**
- **PERMISSIONS**
- **SERVICE ACCOUNT ACTIONS**

### Steps:

1. **Look at the top of the page** - you'll see horizontal tabs
2. **Click the "KEYS" tab** (it's usually the second tab)
3. You'll see a section that says "Keys" with a button that says **"ADD KEY"**

---

## 🎯 Step 3: Create and Download JSON Key

Once you're on the KEYS tab:

1. **Click the blue "ADD KEY" button** (top of the Keys section)

2. **A dropdown menu appears** - Click **"Create new key"**

3. **A popup window appears** with two options:
   - JSON (radio button) ← **SELECT THIS**
   - P12 (radio button)

4. **Click "CREATE"** (blue button, bottom right)

5. **A JSON file downloads automatically!**
   - Check your Downloads folder
   - File name will be like: `peerpoint-calendar-service-abc123-def456.json`

---

## 📍 Visual Guide

```
Service Accounts Page:
┌─────────────────────────────────────────┐
│ Email                          │ Name   │
├─────────────────────────────────────────┤
│ peerpoint-calendar-service@... │ peer...│ ← CLICK EMAIL HERE
└─────────────────────────────────────────┘

Service Account Details Page:
┌─────────────────────────────────────────┐
│ [DETAILS] [KEYS] [PERMISSIONS]         │ ← CLICK KEYS TAB
│                                         │
│ Keys                                    │
│ ┌───────────────────────────────────┐  │
│ │ [ADD KEY] button                  │  │ ← CLICK THIS
│ └───────────────────────────────────┘  │
└─────────────────────────────────────────┘

After clicking ADD KEY:
┌─────────────────────────────────────────┐
│ Create new key                          │
│                                         │
│ ○ JSON  ← SELECT THIS                  │
│ ○ P12                                   │
│                                         │
│                    [CREATE] [CANCEL]   │ ← CLICK CREATE
└─────────────────────────────────────────┘
```

---

## 🆘 Troubleshooting

**Can't see the service account list?**
- Make sure you're in "APIs & Services" → "Credentials"
- Scroll down the page - service accounts are below API keys

**Can't find the KEYS tab?**
- Make sure you clicked on the service account EMAIL (not just anywhere)
- The KEYS tab should be visible at the top of the details page

**JSON file didn't download?**
- Check your browser's download settings
- Look in your Downloads folder
- Check if a popup blocker prevented the download
- Try again - click "ADD KEY" → "Create new key" → "JSON" → "CREATE"

---

## ✅ Once You Have the JSON File

Tell me the file path and I'll format everything for you!

Example paths:
- `~/Downloads/peerpoint-calendar-service-abc123.json`
- `/Users/ameliaabernethy/Downloads/peerpoint-calendar-service-abc123.json`
