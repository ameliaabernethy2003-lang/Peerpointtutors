#!/bin/bash

# Script to set up custom domains for local development
# Run with: bash setup-domains.sh

echo "Setting up custom domains for local development..."
echo ""

# Check if running on macOS
if [[ "$OSTYPE" == "darwin"* ]]; then
    HOSTS_FILE="/etc/hosts"
    echo "Detected macOS"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    HOSTS_FILE="/etc/hosts"
    echo "Detected Linux"
else
    echo "Unsupported OS. Please manually edit your hosts file."
    exit 1
fi

# Check if entries already exist
if grep -q "P2Ptutors.com" "$HOSTS_FILE"; then
    echo "⚠️  P2Ptutors.com already exists in hosts file"
else
    echo "Adding P2Ptutors.com to hosts file..."
    echo "127.0.0.1 P2Ptutors.com" | sudo tee -a "$HOSTS_FILE" > /dev/null
    echo "✅ Added P2Ptutors.com"
fi

if grep -q "P2Ptutorsapplication.com" "$HOSTS_FILE"; then
    echo "⚠️  P2Ptutorsapplication.com already exists in hosts file"
else
    echo "Adding P2Ptutorsapplication.com to hosts file..."
    echo "127.0.0.1 P2Ptutorsapplication.com" | sudo tee -a "$HOSTS_FILE" > /dev/null
    echo "✅ Added P2Ptutorsapplication.com"
fi

echo ""
echo "✅ Domain setup complete!"
echo ""
echo "Next steps:"
echo "1. Start your dev server: npm run dev"
echo "2. Access your sites:"
echo "   - Main site: http://P2Ptutors.com:3000"
echo "   - Signup form: http://P2Ptutorsapplication.com:3000"
echo ""
echo "To use port 80 (no :3000 needed), run: sudo npm run dev:80"

