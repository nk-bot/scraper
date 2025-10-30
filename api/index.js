// Proxy requests to the product endpoint
const product = require('./product');

module.exports = async (req, res) => {
  // Check if the request is for /api/product
  if (req.url.startsWith('/api/product')) {
    return product(req, res);
  }
  
  // Otherwise return not found
  res.status(404).json({ error: 'Not found' });
};

