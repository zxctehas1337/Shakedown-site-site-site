const { PRODUCTS } = require('../_lib/products');

module.exports = (req, res) => {
  const { id } = req.query;
  const product = PRODUCTS.find(p => p.id === id);
  
  if (!product) {
    return res.json({ success: false, message: 'Продукт не найден' });
  }
  
  res.json({ success: true, data: product });
};
