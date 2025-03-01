const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

// Read the email template files
const confirmationTemplateSrc = fs.readFileSync(
  path.join(__dirname, "orderConfirmationTemplate.hbs"),
  "utf8"
);
const confirmationTemplate = handlebars.compile(confirmationTemplateSrc);
const processedTemplateSrc = fs.readFileSync(
  path.join(__dirname, "orderProcessedTemplate.hbs"),
  "utf8"
);
const processedTemplate = handlebars.compile(processedTemplateSrc);

// Register a custom helper for currency formatting
handlebars.registerHelper("currency", function (value) {
  return new Intl.NumberFormat("fi-FI", {
    style: "currency",
    currency: "EUR",
  }).format(value);
});

class EmailService {
  constructor() {
    // Configure the transporter for gmail
    this.transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });
  }

  // Send order confirmation email
  async sendOrderConfirmationEmail(customerEmail, orderId, cartData) {
    try {
      const orderItems = cartData.cartItems.map((item) => ({
        name: item.product.name,
        quantity: item.quantity,
        price: parseFloat(item.product.price),
        total: parseFloat(item.product.price) * item.quantity,
      }));

      const shippingCost = cartData.shippingOption.price;
      const shippingName = cartData.shippingOption.name;

      const subTotal = orderItems.reduce((acc, item) => {
        return acc + item.total;
      }, 0);

      const orderTotal = (subTotal + parseFloat(shippingCost)).toFixed(2);

      const data = {
        orderId: orderId,
        orderItems: orderItems,
        shippingCost: shippingCost,
        shippingName: shippingName,
        subTotal: subTotal,
        orderTotal: orderTotal,
      };

      const emailHtml = confirmationTemplate(data);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: `Kiitos tilauksestasi!`,
        html: emailHtml,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`Failed to send confirmation email: ${error.message}`);
    }
  }

  // Send order processed email
  async sendOrderProcessedEmail(
    customerEmail,
    orderId,
    shippingName,
    trackingNumber
  ) {
    try {
      const data = {
        orderId: orderId,
        shippingName: shippingName,
        trackingNumber: trackingNumber,
      };

      const emailHtml = processedTemplate(data);

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: `Tilauksesi on käsitelty!`,
        html: emailHtml,
      };

      await this.transporter.sendMail(mailOptions);
    } catch (error) {
      throw new Error(`Failed to send order processed email: ${error.message}`);
    }
  }
}

module.exports = new EmailService();
