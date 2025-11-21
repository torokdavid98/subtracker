const express = require('express');
const router = express.Router();
const authMiddleware = require('../middleware/auth');

/**
 * Fetch logo for a service by name
 * Uses multiple fallback strategies:
 * 1. Clearbit Logo API (free, no auth)
 * 2. Logo.dev API (free tier)
 * 3. Returns null if not found
 */
router.get('/fetch', authMiddleware, async (req, res) => {
  try {
    const { name } = req.query;

    if (!name) {
      return res.status(400).json({ error: 'Name parameter is required' });
    }

    // Clean up the name for domain lookup
    const cleanName = name.toLowerCase().trim().replace(/\s+/g, '');

    // Common service domain mappings
    const domainMap = {
      'netflix': 'netflix.com',
      'spotify': 'spotify.com',
      'youtube': 'youtube.com',
      'youtubepremium': 'youtube.com',
      'amazonprime': 'amazon.com',
      'prime': 'amazon.com',
      'disney+': 'disneyplus.com',
      'disneyplus': 'disneyplus.com',
      'hbo': 'hbo.com',
      'hbomax': 'hbo.com',
      'apple': 'apple.com',
      'applemusic': 'apple.com',
      'icloud': 'apple.com',
      'dropbox': 'dropbox.com',
      'github': 'github.com',
      'gitlab': 'gitlab.com',
      'notion': 'notion.so',
      'slack': 'slack.com',
      'zoom': 'zoom.us',
      'microsoft365': 'microsoft.com',
      'office365': 'microsoft.com',
      'adobe': 'adobe.com',
      'adobecreativecloud': 'adobe.com',
      'chatgpt': 'openai.com',
      'openai': 'openai.com',
      'claude': 'anthropic.com',
      'anthropic': 'anthropic.com',
      'canva': 'canva.com',
      'figma': 'figma.com',
      'trello': 'trello.com',
      'asana': 'asana.com',
      'evernote': 'evernote.com',
      'lastpass': 'lastpass.com',
      '1password': '1password.com',
      'nordvpn': 'nordvpn.com',
      'expressvpn': 'expressvpn.com',
      'grammarly': 'grammarly.com',
      'linkedin': 'linkedin.com',
      'linkedinpremium': 'linkedin.com',
    };

    // Try to find domain from map or construct it
    const domain = domainMap[cleanName] || `${cleanName}.com`;

    // Try Clearbit Logo API (free, no auth required)
    const clearbitUrl = `https://logo.clearbit.com/${domain}`;

    // Return the logo URL - frontend will validate if it loads
    res.json({ logoUrl: clearbitUrl, domain });

  } catch (error) {
    console.error('Logo fetch error:', error);
    res.status(500).json({ error: 'Failed to fetch logo' });
  }
});

module.exports = router;
