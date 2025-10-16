import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import userRoutes from "./routes/userroutes.js";
import customerRoutes from "./routes/customerroutes.js";
import brandRoutes from "./routes/brandroutes.js";
import productRoutes from "./routes/productroutes.js";
import salesRoutes from "./routes/salesroute.js";
import warrantyRoutes from "./routes/warranty.js";
import supportTicketRoutes from "./routes/supportticketroute.js";
import pool from './db.js'; 
import authRoutes from "./routes/authrouth.js";
dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes
app.use("/siruvai/users", userRoutes);
app.use("/siruvai/add", userRoutes);
app.use("/siruvai/customers", customerRoutes);
app.use("/siruvai/brands", brandRoutes);
app.use("/siruvai/products", productRoutes);
app.use("/siruvai/sales",salesRoutes);
app.use("/uploads", express.static("uploads"));
app.use("/siruvai/warranty", warrantyRoutes);
app.use("/siruvai/support", supportTicketRoutes);
app.use("/siruvai/auth", authRoutes);



app.get("/", (req, res) => {
  res.send("Backend API Running ✅");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

pool.query('SELECT NOW()')
  .then(res => console.log('DB connected, current time:', res.rows[0]))
  .catch(err => console.error('DB connection error:', err));