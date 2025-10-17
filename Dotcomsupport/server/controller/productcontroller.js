import { addProduct, getProducts } from "../models/productmodel.js";
import { getBrands } from "../models/brandmodel.js"; // helper to check brand exists

// POST /products → add a new product
export const createProduct = async (req, res) => {
  try {
    const { product_name, model_no, serial_no, brand_name } = req.body;

    if (!product_name || !brand_name) {
      return res.status(400).json({ error: "product_name and brand_name are required" });
    }

    // Validate brand exists in brands table
    const brand = await getBrands(brand_name);
    if (!brand) {
      return res.status(400).json({ error: "Invalid brand selected" });
    }

    const product = await addProduct({ product_name, model_no, serial_no, brand_name });
    res.status(201).json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /products → get all products
export const listProducts = async (req, res) => {
  try {
    const products = await getProducts();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};