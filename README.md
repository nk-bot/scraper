# Product Scraper - E-commerce Product Details Fetcher

A web application that fetches and displays product details from e-commerce websites. Simply paste a product URL and get comprehensive details including title, price, images, description, specifications, and more.

## Features

- 🛍️ Extract product information from e-commerce URLs
- 🖼️ Display product images in a gallery
- 💰 Show pricing and availability information
- ⭐ Display ratings and reviews
- 📝 Parse product descriptions and specifications
- 🔍 Real-time scraping with error handling

## Tech Stack

- **Backend:** Node.js, Express.js
- **Frontend:** Vanilla HTML/CSS/JavaScript
- **Scraping:** Cheerio (HTML parsing), Axios (HTTP requests)
- **Additional:** CORS support, dotenv for configuration

## Installation

1. Clone the repository:
```bash
git clone <your-repo-url>
cd product-scraper
```

2. Install dependencies:
```bash
npm install
```

3. (Optional) Configure Scraping API:
Create a `.env` file in the root directory and add your ScraperAPI key:
```
SCRAPER_API=your_scraper_api_key_here
```

## Usage

1. Start the server:
```bash
node server.js
```

2. Open `public/index.html` in your browser

3. Paste any product URL and click "Fetch"

## API Endpoints

### GET `/api/product`
Fetches product details from a URL.

**Query Parameters:**
- `url` (required): The product URL to scrape

**Response:**
```json
{
  "ok": true,
  "data": {
    "url": "...",
    "title": "Product Name",
    "price": "$99.99",
    "currency": "USD",
    "availability": "In stock",
    "rating": "4.5",
    "sku": "PROD123",
    "brand": "Brand Name",
    "description": "Product description...",
    "images": ["url1", "url2"],
    "specs": [{"key": "Color", "value": "Red"}]
  }
}
```

### GET `/api/test`
Health check endpoint to verify server is running.

**Response:**
```json
{
  "ok": true,
  "message": "Server is running!"
}
```

## Project Structure

```
product-scraper/
├── server.js          # Express server and scraping logic
├── public/
│   └── index.html     # Frontend UI
├── package.json       # Dependencies
├── .env               # Environment variables (create this)
├── .gitignore
└── README.md
```

## Supported Sites

The scraper works best with:
- Standard e-commerce platforms with structured metadata
- Sites using Open Graph or schema.org markup
- General product listing pages

**Note:** Some sites like Amazon may block direct scraping. For production use, consider using a scraping service or API.

## Development

The server runs on `http://localhost:4000` by default. You can change the port by setting the `PORT` environment variable.

## License

MIT

