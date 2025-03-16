const express = require("express");
const mongoose = require("mongoose");
const bodyParser = require("body-parser");
const cors = require("cors");

// Initialize app
const app = express();

// Middleware
app.use(bodyParser.json());
app.use(cors());

// MongoDB connection
mongoose.connect("mongodb://localhost:27017/invoiceDB", {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log("MongoDB connection error:", err));

// Invoice model
const invoiceSchema = new mongoose.Schema({
  dateTime: String,
  items: Array,
  discount: Number,
  gst: Number,
  subtotal: Number,
  total: Number,
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

// Routes

// GET all invoices
app.get("/api/invoices", async (req, res) => {
  try {
    const invoices = await Invoice.find();
    res.json(invoices);
  } catch (err) {
    res.status(500).json({ error: "Failed to fetch invoices" });
  }
});

// POST new invoice
app.post("/api/invoices", async (req, res) => {
  const newInvoice = new Invoice(req.body);

  try {
    await newInvoice.save();
    res.status(201).json(newInvoice);
  } catch (err) {
    res.status(500).json({ error: "Failed to save invoice" });
  }
});

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
