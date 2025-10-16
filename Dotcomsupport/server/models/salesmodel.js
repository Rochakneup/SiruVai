import pool from "../db.js";

// Add sale and its items
export const addSaleWithItems = async ({ bill_no, sale_date, total_amount, customer_id, items }) => {
  const client = await pool.connect();
  try {
    await client.query("BEGIN");

    // Insert into sales
    const saleResult = await client.query(
      `INSERT INTO sales (bill_no, sale_date, total_amount, customer_id, created_at, updated_at)
       VALUES ($1, $2, $3, $4, NOW(), NOW())
       RETURNING *`,
      [bill_no, sale_date, total_amount, customer_id]
    );

    const sale = saleResult.rows[0];

    // Insert sale items (batch insert for better performance)
    if (items.length > 0) {
      const values = items.map((_, idx) => 
        `($1, $${idx * 3 + 2}, $${idx * 3 + 3}, $${idx * 3 + 4}, NOW())`
      ).join(',');
      
      const params = [sale.sale_id];
      items.forEach(item => {
        params.push(item.product_id, item.quantity, item.unit_price);
      });

      await client.query(
        `INSERT INTO sale_items (sale_id, product_id, quantity, unit_price, created_at)
         VALUES ${values}`,
        params
      );
    }

    // Get complete sale with items
    const itemsResult = await client.query(
      `SELECT si.*, p.product_name 
       FROM sale_items si
       LEFT JOIN products p ON si.product_id = p.product_id
       WHERE si.sale_id = $1`,
      [sale.sale_id]
    );

    await client.query("COMMIT");
    return { ...sale, items: itemsResult.rows };
  } catch (err) {
    await client.query("ROLLBACK");
    throw err;
  } finally {
    client.release();
  }
};

// Get all sales
export const getSales = async () => {
  const result = await pool.query(`
    SELECT 
      s.*,
      c.name,
      json_agg(
        json_build_object(
          'sale_item_id', si.sale_item_id,
          'product_id', si.product_id,
          'product_name', p.product_name,
          'quantity', si.quantity,
          'unit_price', si.unit_price
        ) ORDER BY si.sale_item_id
      ) FILTER (WHERE si.sale_item_id IS NOT NULL) as items
    FROM sales s
    JOIN customers c ON s.customer_id = c.customer_id
    LEFT JOIN sale_items si ON s.sale_id = si.sale_id
    LEFT JOIN products p ON si.product_id = p.product_id
    GROUP BY s.sale_id, c.name
    ORDER BY s.created_at DESC
  `);
  return result.rows;
};

// Get single sale by ID
export const getSaleById = async (saleId) => {
  const result = await pool.query(
    `SELECT 
      s.*,
      c.name,
      json_agg(
        json_build_object(
          'sale_item_id', si.sale_item_id,
          'product_id', si.product_id,
          'product_name', p.product_name,
          'quantity', si.quantity,
          'unit_price', si.unit_price
        ) ORDER BY si.sale_item_id
      ) FILTER (WHERE si.sale_item_id IS NOT NULL) as items
    FROM sales s
    JOIN customers c ON s.customer_id = c.customer_id
    LEFT JOIN sale_items si ON s.sale_id = si.sale_id
    LEFT JOIN products p ON si.product_id = p.product_id
    WHERE s.sale_id = $1
    GROUP BY s.sale_id, c.name`,
    [saleId]
  );
  return result.rows[0];
};