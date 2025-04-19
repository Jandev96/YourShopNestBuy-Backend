// utils/invoiceGenerator.js
import PDFDocument from "pdfkit";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const generateInvoicePDF = async (order, user) => {
  return new Promise((resolve, reject) => {
    const doc = new PDFDocument({ margin: 50 });
    const buffers = [];

    doc.on("data", (chunk) => buffers.push(chunk));
    doc.on("end", () => resolve(Buffer.concat(buffers)));
    doc.on("error", reject);

    // Styles
    const headingFont = "Helvetica-Bold";
    const normalFont = "Helvetica";

    // Logo
    const logoPath = path.join(__dirname, "../assets/logo.png");
    doc.image(logoPath, 50, 45, { width: 60 });

    // Title and Invoice Info
    doc.font(headingFont).fontSize(20).text("INVOICE", 400, 50, { align: "right" });
    doc.font(normalFont).fontSize(10)
      .text(`Invoice #: ${order._id}`, { align: "right" })
      .text(`Date: ${new Date(order.orderDate).toDateString()}`, { align: "right" });

    doc.moveDown(2);

    // Customer Info
    doc.font(headingFont).fontSize(12).text("BILLED TO", 50);
    doc.font(normalFont).fontSize(10)
      .text(user.username)
      .text(user.email)
      .text(`${order.shippingAddress.street}`)
      .text(`${order.shippingAddress.city}, ${order.shippingAddress.state} ${order.shippingAddress.zipCode}`)
      .text(`${order.shippingAddress.country}`);

    doc.moveDown(2);

    // Table Header
    const tableTop = doc.y;
    const columnPositions = {
      item: 50,
      quantity: 250,
      unitPrice: 350,
      total: 450,
    };

    doc.font(headingFont).fontSize(11)
      .text("Item", columnPositions.item, tableTop)
      .text("Quantity", columnPositions.quantity, tableTop)
      .text("Unit Price", columnPositions.unitPrice, tableTop)
      .text("Total", columnPositions.total, tableTop);

    doc.moveTo(50, doc.y + 5).lineTo(550, doc.y + 5).stroke();
    doc.moveDown(0.5);

    // Table Rows
    order.products.forEach((p) => {
      const itemY = doc.y + 2;
      const total = (p.price * p.quantity).toFixed(2);

      doc.font(normalFont).fontSize(10)
        .text(p.name || p.productId, columnPositions.item, itemY)
        .text(p.quantity.toString(), columnPositions.quantity, itemY)
        .text(`INR ${p.price.toFixed(2)}`, columnPositions.unitPrice, itemY)
        .text(`INR ${total}`, columnPositions.total, itemY);

      doc.moveDown(1);
    });

    // Summary
    doc.moveDown(2);
    const summaryStartY = doc.y;
    const labelX = 350;
    const valueX = 470;

    doc.fontSize(10).font(normalFont);
    doc.text("Subtotal:", labelX, summaryStartY);
    doc.text(`INR ${(order.totalPrice - order.tax + order.discount).toFixed(2)}`, valueX, summaryStartY);

    const taxY = doc.y + 5;
    doc.text("Tax:", labelX, taxY);
    doc.text(`INR ${order.tax.toFixed(2)}`, valueX, taxY);

    const discountY = doc.y + 5;
    doc.text("Discount:", labelX, discountY);
    doc.text(`INR ${order.discount.toFixed(2)}`, valueX, discountY);

    const totalY = doc.y + 10;
    doc.font(headingFont).text("Total:", labelX, totalY);
    doc.text(`INR ${order.totalPrice.toFixed(2)}`, valueX, totalY);

    // Footer
    doc.moveDown(4);
    doc.fontSize(10).fillColor("gray")
      .text("Thank you for your purchase!", 50, doc.y, { align: "center" });

    doc.end();
  });
};
