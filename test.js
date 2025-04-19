import fs from "fs";
import { generateInvoicePDF } from "./utils/invoiceGenerator.js";

// Dummy order & user for testing
const dummyOrder = {
  _id: "INV-123456",
  orderDate: new Date(),
  shippingAddress: {
    street: "123 Main St",
    city: "Lagos",
    state: "LA",
    zipCode: "10001",
    country: "Nigeria"
  },
  products: [
    { productId: "P001", quantity: 2, price: 25.0 },
    { productId: "P002", quantity: 1, price: 10.0 }
  ],
  totalPrice: 60.0,
  tax: 5.0,
  discount: 10.0
};

const dummyUser = {
  username: "dtroz",
  email: "dtroz@example.com"
};

const runTest = async () => {
  const pdfBuffer = await generateInvoicePDF(dummyOrder, dummyUser);

  fs.writeFileSync("test-invoice.pdf", pdfBuffer);
  console.log("✅ PDF saved as test-invoice.pdf");
};

runTest();
