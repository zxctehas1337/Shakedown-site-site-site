const { PRODUCTS } = require('../_lib/products');

module.exports = (req, res) => {
  res.json({ success: true, data: PRODUCTS });
};
