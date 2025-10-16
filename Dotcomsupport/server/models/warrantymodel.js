import pool from "../db.js";

export const addWarrantyCard = async ({
  sale_item_id,
  customer_id,
  product_id,
  warranty_start_date,
  warranty_end_date,
  warranty_image,
  warranty_card_no,
}) => {
  const query = `
    INSERT INTO warranty_cards
      (sale_item_id, customer_id, product_id, warranty_start_date, warranty_end_date, warranty_card_image, warranty_card_no)
    VALUES ($1,$2,$3,$4,$5,$6,$7)
    RETURNING *
  `;
  const values = [sale_item_id, customer_id, product_id, warranty_start_date, warranty_end_date, warranty_image, warranty_card_no];
  const { rows } = await pool.query(query, values);
  return rows[0];
};

export const getAllWarrantyCards = async () => {
  const { rows } = await pool.query("SELECT * FROM warranty_cards ORDER BY created_at DESC");
  return rows;
};
