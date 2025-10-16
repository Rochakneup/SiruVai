import { addBrand, getBrands } from "../models/brandmodel.js";

// POST /brands → add a new brand
export const createBrand = async (req, res) => {
  try {
    const { brand_name } = req.body;
    if (!brand_name) {
      return res.status(400).json({ error: "brand_name is required" });
    }
    const brand = await addBrand(brand_name);
    res.status(201).json(brand);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};

// GET /brands → get all brands
export const listBrands = async (req, res) => {
  try {
    const brands = await getBrands();
    res.json(brands);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
};
