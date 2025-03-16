import React, { useState, useEffect } from "react";
import html2canvas from "html2canvas";

import "./App.css";

const API_URL = "http://localhost:5000/api/invoices";

const App = () => {
  const [dateTime, setDateTime] = useState(new Date().toLocaleString());
  const [itemName, setItemName] = useState("");
  const [itemPrice, setItemPrice] = useState("");
  const [itemQuantity, setItemQuantity] = useState("");
  const [discount, setDiscount] = useState(0);
  const [gst, setGst] = useState(18);
  const [items, setItems] = useState([]);
  const [subtotal, setSubtotal] = useState(0);
  const [invoices, setInvoices] = useState([]);
  const [logo, setLogo] = useState(null);
  const [status, setStatus] = useState("Unpaid");
  const [paymentMethod, setPaymentMethod] = useState("");
  const [drafts, setDrafts] = useState([]);
  const [totalRevenue, setTotalRevenue] = useState(0);
  const [shopName, setShopName] = useState("My Shop");
  const [isShopNameContainerVisible, setIsShopNameContainerVisible] = useState(false);

  const fetchInvoices = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setInvoices(data);
    } catch (error) {
      console.error("Error fetching invoices:", error);
    }
  };

  useEffect(() => {
    const interval = setInterval(() => {
      setDateTime(new Date().toLocaleString());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    const total = items.reduce((sum, item) => sum + item.price * item.quantity, 0);
    setSubtotal(total);
  }, [items]);

  const calculateTotal = () => {
    const discountAmount = (discount / 100) * subtotal;
    const gstAmount = (gst / 100) * subtotal;
    const total = subtotal - discountAmount + gstAmount;
    return { discountAmount, gstAmount, total };
  };

  const addItem = () => {
    if (!itemName || itemPrice <= 0 || itemQuantity <= 0) {
      alert("Please enter valid item details.");
      return;
    }

    setItems([...items, { name: itemName, price: parseFloat(itemPrice), quantity: parseInt(itemQuantity) }]);
    setItemName("");
    setItemPrice("");
    setItemQuantity("");
  };

  const handleLogoUpload = (event) => {
    const file = event.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = () => setLogo(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const downloadInvoice = () => {
    const element = document.getElementById("invoice-container");
    html2canvas(element).then((canvas) => {
      const link = document.createElement("a");
      link.href = canvas.toDataURL();
      link.download = "invoice.png";
      link.click();
    });
  };

  const saveInvoice = async () => {
    const { discountAmount, gstAmount, total } = calculateTotal();

    const newInvoice = {
      dateTime,
      items,
      discount,
      gst,
      subtotal,
      total,
      status,
      paymentMethod: status === "Paid" ? paymentMethod : "",
    };

    try {
      const response = await fetch(API_URL, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(newInvoice),
      });

      if (response.ok) {
        alert("Invoice saved successfully!");
        fetchInvoices();
      } else {
        alert("Failed to save the invoice.");
      }
    } catch (error) {
      console.error("Error saving invoice:", error);
    }
  };

  const saveDraft = () => {
    const draft = {
      dateTime,
      items,
      discount,
      gst,
      subtotal,
      status,
      paymentMethod: status === "Paid" ? paymentMethod : "",
    };
    setDrafts([...drafts, draft]);
    alert("Draft saved successfully!");
  };

  const { discountAmount, gstAmount, total } = calculateTotal();

  return (
    <div className="container" id="invoice-container">
      <h1 onClick={() => setIsShopNameContainerVisible(!isShopNameContainerVisible)}>
        Invoice Generator
      </h1>
      
      {isShopNameContainerVisible && (
        <div className="shop-name-container">
          <label>Shop Name:</label>
          <input
            type="text"
            value={shopName}
            onChange={(e) => setShopName(e.target.value)}
            placeholder="Enter shop name"
          />
        </div>
      )}

      <div className="invoice-header">
        <span>Date and Time: {dateTime}</span>
        <div>
          <label>Upload Logo: </label>
          <input type="file" accept="image/*" onChange={handleLogoUpload} />
        </div>
      </div>

      {logo && <img src={logo} alt="Shop Logo" className="shop-logo-small" />}

      <div className="add-item">
        <label>Item Name:</label>
        <input
          type="text"
          placeholder="Enter item name"
          value={itemName}
          onChange={(e) => setItemName(e.target.value)}
        />
        <label>Item Price:</label>
        <input
          type="number"
          placeholder="Enter item price"
          value={itemPrice}
          onChange={(e) => setItemPrice(e.target.value)}
        />
        <label>Quantity:</label>
        <input
          type="number"
          placeholder="Enter quantity"
          value={itemQuantity}
          onChange={(e) => setItemQuantity(e.target.value)}
        />
        <button onClick={addItem}>Add Item</button>
      </div>

      <div className="discount-gst">
        <label>Discount (%):</label>
        <input
          type="number"
          placeholder="Enter discount"
          value={discount}
          onChange={(e) => setDiscount(e.target.value)}
        />
        <label>GST (%):</label>
        <input
          type="number"
          placeholder="Enter GST"
          value={gst}
          onChange={(e) => setGst(e.target.value)}
        />
      </div>

      <div className="status-payment">
        <div className="status">
          <label>Status:</label>
          <select value={status} onChange={(e) => setStatus(e.target.value)}>
            <option value="Unpaid">Unpaid</option>
            <option value="Paid">Paid</option>
          </select>
        </div>

        {status === "Paid" && (
          <div className="payment-method">
            <label>Payment Method:</label>
            <select value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value)}>
              <option value="">Select Payment Method</option>
              <option value="UPI">UPI</option>
              <option value="Cash">Cash</option>
              <option value="Card">Card</option>
            </select>
          </div>
        )}
      </div>

      <table>
        <thead>
          <tr>
            <th>Item Name</th>
            <th>Price</th>
            <th>Quantity</th>
            <th>Total</th>
          </tr>
        </thead>
        <tbody>
          {items.map((item, index) => (
            <tr key={index}>
              <td>{item.name}</td>
              <td>{item.price.toFixed(2)}</td>
              <td>{item.quantity}</td>
              <td>{(item.price * item.quantity).toFixed(2)}</td>
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan="3">Subtotal</td>
            <td>{subtotal.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan="3">Discount</td>
            <td>{discountAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan="3">GST</td>
            <td>{gstAmount.toFixed(2)}</td>
          </tr>
          <tr>
            <td colSpan="3">Total</td>
            <td>{total.toFixed(2)}</td>
          </tr>
        </tfoot>
      </table>

      <button onClick={downloadInvoice}>Download Invoice</button>
      <button onClick={saveInvoice}>Save Invoice</button>
      <button onClick={saveDraft}>Save as Draft</button>

      <h2>Saved Invoices</h2>
      <ul>
        {invoices.map((invoice, index) => (
          <li key={index}>
            <strong>{invoice.dateTime}</strong> - Total: {invoice.total.toFixed(2)} - Status: {invoice.status} - Payment Method: {invoice.paymentMethod}
          </li>
        ))}
      </ul>

      <h2>Drafts</h2>
      <ul>
        {drafts.map((draft, index) => (
          <li key={index}>
            <strong>{draft.dateTime}</strong> - Total: {draft.subtotal.toFixed(2)} - Status: {draft.status} - Payment Method: {draft.paymentMethod}
          </li>
        ))}
      </ul>

      <h2>Dashboard</h2>
      <p>Total Invoices: {invoices.length}</p>
      <p>Total Drafts: {drafts.length}</p>
      <p>
        Total Revenue:{" "}
        <input
          type="number"
          value={totalRevenue}
          onChange={(e) => setTotalRevenue(e.target.value)}
        />
      </p>
    </div>
  );
};

export default App;
