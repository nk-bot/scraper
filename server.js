require('dotenv').config();
const express = require('express');
const axios = require('axios');
const cheerio = require('cheerio');
const cors = require('cors');

const app = express();
app.use(cors());
app.use(express.json({ limit: '200kb' }));

function extractText($, selectors) {
  for (const sel of selectors) {
    const t = $(sel).first().text().trim();
    if (t) return t;
  }
  return '';
}

function parsePrice(text) {
  if (!text) return '';
  const m = text.replace(/\s+/g, ' ').match(/[$€£₹]\s?\d[\d,\.]*/);
  return m ? m[0] : text;
}

function unique(arr) {
  return [...new Set(arr.filter(Boolean))];
}

function parseProduct(html, url) {
  const $ = cheerio.load(html);

  const title =
    $('meta[property="og:title"]').attr('content') ||
    $('meta[name="twitter:title"]').attr('content') ||
    extractText($, ['.product-title', 'h1#title', 'h1']) ||
    $('title').text().trim();

  const priceRaw =
    $('meta[property="product:price:amount"]').attr('content') ||
    extractText($, [
      '.price',
      '.product-price',
      '.a-price .a-offscreen',
      '#priceblock_ourprice',
      '#priceblock_dealprice',
      '[itemprop="price"]'
    ]);
  const price = parsePrice(priceRaw);

  const currency =
    $('meta[property="product:price:currency"]').attr('content') ||
    $('meta[itemprop="priceCurrency"]').attr('content') ||
    '';

  const description =
    $('meta[name="description"]').attr('content') ||
    extractText($, [
      '#productDescription',
      '.product-description',
      '[data-test="product-description"]',
      '[itemprop="description"]',
      '.a-expander-content'
    ]);

  const images = unique([
    $('meta[property="og:image"]').attr('content'),
    ...$('img').map((_, el) => $(el).attr('src')).get(),
  ])
    .filter(src => src && !src.startsWith('data:'))
    .slice(0, 8);

  const availability = extractText($, [
    '#availability .a-color-state',
    '#availability .a-color-success',
    '.in-stock',
    '.stock',
    '.availability',
    '[data-test="availability"]'
  ]);

  const rating =
    extractText($, ['.a-icon-alt', '.rating', '.stars', '[data-test="rating"]']) ||
    $('meta[itemprop="ratingValue"]').attr('content') ||
    '';

  const sku =
    $('meta[property="product:retailer_item_id"]').attr('content') ||
    $('[itemprop="sku"]').attr('content') ||
    extractText($, ['.sku', '#sku']) ||
    '';

  const brand =
    $('meta[property="product:brand"]').attr('content') ||
    $('[itemprop="brand"] [itemprop="name"]').text().trim() ||
    $('[itemprop="brand"]').attr('content') ||
    extractText($, ['.brand', '#bylineInfo']) ||
    '';

  const specs = [];
  $('table, .specs, #productDetails_techSpec_section_1, #productDetails_techSpec_section_2')
    .first()
    .find('tr')
    .each((_, tr) => {
      const cells = $(tr).find('th,td');
      if (cells.length >= 2) {
        const key = $(cells[0]).text().trim().replace(/:$/, '');
        const value = $(cells[1]).text().trim();
        if (key && value) specs.push({ key, value });
      }
    });

  return {
    url,
    title,
    price,
    currency,
    availability,
    rating,
    sku,
    brand,
    description,
    images,
    specs,
  };
}

app.get('/api/product', async (req, res) => {
  const url = req.query.url;
  if (!url) return res.status(400).json({ error: 'Missing url query param' });

  try {
    const target = (function withScraperApi(u) {
      const key = process.env.SCRAPER_API;
      if (!key) return u;
      const endpoint = 'https://api.scraperapi.com';
      const params = new URLSearchParams({ api_key: key, url: u, keep_headers: 'true' });
      return `${endpoint}?${params.toString()}`;
    })(url);

    console.log(`Fetching: ${url}`);

    const response = await axios.get(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        Accept: 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'en-US,en;q=0.9',
        'Accept-Encoding': 'gzip, deflate, br',
        Connection: 'keep-alive',
        'Upgrade-Insecure-Requests': '1',
      },
      timeout: 30000,
      maxRedirects: 5,
    });

    console.log(`Response status: ${response.status}`);

    const data = parseProduct(response.data, url);
    res.json({ ok: true, data });
  } catch (err) {
    console.error(`Error fetching ${url}:`, err.message);
    res.status(500).json({
      ok: false,
      error: 'Failed to fetch or parse product page',
      message: err.message,
      details: err.response?.status ? `HTTP ${err.response.status}` : undefined,
    });
  }
});

app.get('/api/test', (req, res) => {
  res.json({ ok: true, message: 'Server is running!' });
});

// Vercel serverless handler
module.exports = app;

// For local development
const PORT = process.env.PORT || 4000;
if (require.main === module) {
  // Serve static files from public directory (local dev only)
  app.use(express.static('public'));
  
  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
    console.log(`Test endpoint: http://localhost:${PORT}/api/test`);
  });
}

