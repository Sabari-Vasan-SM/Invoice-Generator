const mongoose = require("mongoose");

const invoiceSchema = new mongoose.Schema({
  dateTime: { type: String, required: true },
  items: [
    {
      name: { type: String, required: true },
      price: { type: Number, required: true },
      quantity: { type: Number, required: true },
    },
  ],
  discount: { type: Number, required: true },
  gst: { type: Number, required: true },
  subtotal: { type: Number, required: true },
  total: { type: Number, required: true },
});

const Invoice = mongoose.model("Invoice", invoiceSchema);

module.exports = Invoice;
