import pool from "../db.js";

// Add new ticket
export const addTicket = async (ticketData) => {
  const {
    ticket_no,
    customer_id,
    product_id,
    sale_id,
    assigned_to,
    issue_title,
    issue_description,
    status,
    priority,
    response_text, // ✅ new optional field
  } = ticketData;

  const result = await pool.query(
    `INSERT INTO support_tickets 
      (ticket_no, customer_id, product_id, sale_id, assigned_to, issue_title, issue_description, status, priority, response_text, created_at)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10, CURRENT_TIMESTAMP)
     RETURNING *`,
    [
      ticket_no,
      customer_id,
      product_id,
      sale_id,
      assigned_to,
      issue_title,
      issue_description,
      status,
      priority,
      response_text || null, // ✅ optional
    ]
  );

  return result.rows[0];
};

// Get all tickets
export const getAllTickets = async () => {
  const result = await pool.query(
    `SELECT st.*, c.name AS customer_name, p.product_name, s.bill_no
     FROM support_tickets st
     LEFT JOIN customers c ON st.customer_id = c.customer_id
     LEFT JOIN products p ON st.product_id = p.product_id
     LEFT JOIN sales s ON st.sale_id = s.sale_id
     ORDER BY st.created_at DESC` // ✅ newest first
  );
  return result.rows;
};

// Update ticket
export const updateTicket = async (ticket_id, data) => {
  const {
    customer_id,
    product_id,
    sale_id,
    assigned_to,
    issue_title,
    issue_description,
    status,
    priority,
    resolved_at,
    resolved_by,
    response_text, // ✅ include in update
  } = data;

  const result = await pool.query(
    `UPDATE support_tickets
     SET customer_id = COALESCE($1, customer_id),
         product_id = COALESCE($2, product_id),
         sale_id = COALESCE($3, sale_id),
         assigned_to = COALESCE($4, assigned_to),
         issue_title = COALESCE($5, issue_title),
         issue_description = COALESCE($6, issue_description),
         status = COALESCE($7, status),
         priority = COALESCE($8, priority),
         resolved_at = COALESCE($9, resolved_at),
         resolved_by = COALESCE($10, resolved_by),
         response_text = COALESCE($11, response_text),
         updated_at = CURRENT_TIMESTAMP
     WHERE ticket_id = $12
     RETURNING *`,
    [
      customer_id,
      product_id,
      sale_id,
      assigned_to,
      issue_title,
      issue_description,
      status,
      priority,
      resolved_at,
      resolved_by,
      response_text || null,
      ticket_id,
    ]
  );

  return result.rows[0];
};
// Get ticket by ID
export const getTicketById = async (id) => {
  const result = await pool.query(
    `SELECT * FROM support_tickets WHERE ticket_id = $1`,
    [id]
  );
  return result.rows[0];
};

// Delete ticket
export const deleteTicket = async (id) => {
  const result = await pool.query(
    `DELETE FROM support_tickets WHERE ticket_id = $1 RETURNING *`,
    [id]
  );
  return result.rows[0];
};

