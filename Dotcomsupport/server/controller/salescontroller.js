import { addSaleWithItems, getSales, getSaleById } from "../models/salesmodel.js";

// POST /siruvai/sales/add
export const createSale = async (req, res) => {
  try {
    console.log('Received body:', JSON.stringify(req.body, null, 2));
    
    const { bill_no, sale_date, total_amount, customer_id, items } = req.body;

    // Validate top-level fields
    if (
      !bill_no?.trim() || 
      !sale_date || 
      typeof total_amount !== 'number' || 
      !customer_id || 
      !Array.isArray(items) || 
      items.length === 0
    ) {
      return res.status(400).json({ 
        error: "All fields are required including items.",
        received: {
          bill_no: !!bill_no,
          sale_date: !!sale_date,
          total_amount: typeof total_amount,
          customer_id: !!customer_id,
          items: Array.isArray(items) ? `${items.length} items` : 'not an array'
        }
      });
    }

    // Validate each sale item
    for (let i = 0; i < items.length; i++) {
      const item = items[i];
      if (
        typeof item.product_id !== 'number' ||
        typeof item.quantity !== 'number' ||
        typeof item.unit_price !== 'number'
      ) {
        return res.status(400).json({ 
          error: `Invalid item at index ${i}. All item fields must be valid numbers.`,
          item: item
        });
      }

      // Additional validation
      if (item.quantity <= 0) {
        return res.status(400).json({ 
          error: `Invalid quantity at item index ${i}. Quantity must be greater than 0.` 
        });
      }

      if (item.unit_price < 0) {
        return res.status(400).json({ 
          error: `Invalid unit price at item index ${i}. Unit price cannot be negative.` 
        });
      }
    }

    // Additional validation for total_amount
    if (total_amount <= 0) {
      return res.status(400).json({ error: "Total amount must be greater than 0." });
    }

    const sale = await addSaleWithItems({ bill_no, sale_date, total_amount, customer_id, items });
    res.status(201).json({
      message: "Sale created successfully",
      sale: sale
    });
  } catch (err) {
    console.error('Sale creation error:', err);
    
    // Handle specific database errors
    if (err.code === '23505') { // Unique violation
      return res.status(409).json({ error: 'Bill number already exists' });
    }
    if (err.code === '23503') { // Foreign key violation
      return res.status(400).json({ error: 'Invalid customer or product ID' });
    }
    
    res.status(500).json({ error: 'Failed to create sale', details: err.message });
  }
};

// GET /siruvai/sales
export const listSales = async (req, res) => {
  try {
    const sales = await getSales();
    res.json({
      count: sales.length,
      sales: sales
    });
  } catch (err) {
    console.error('Error fetching sales:', err);
    res.status(500).json({ error: 'Failed to fetch sales', details: err.message });
  }
};

// GET /siruvai/sales/:id
export const getSale = async (req, res) => {
  try {
    const { id } = req.params;
    const sale = await getSaleById(id);
    
    if (!sale) {
      return res.status(404).json({ error: 'Sale not found' });
    }
    
    res.json(sale);
  } catch (err) {
    console.error('Error fetching sale:', err);
    res.status(500).json({ error: 'Failed to fetch sale', details: err.message });
  }
};