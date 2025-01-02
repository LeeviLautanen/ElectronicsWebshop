const nodemailer = require("nodemailer");
const fs = require("fs");
const path = require("path");
const handlebars = require("handlebars");

// Read the email template file
const templatePath = path.join(__dirname, "orderConfirmationTemplate.hbs");
const templateSource = fs.readFileSync(templatePath, "utf8");
const template = handlebars.compile(templateSource);

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

      const orderTotal = subTotal + shippingCost;

      const emailHtml = template({
        orderId: orderId,
        orderItems: orderItems,
        shippingCost: shippingCost,
        shippingName: shippingName,
        subTotal: subTotal,
        orderTotal: orderTotal,
      });

      const mailOptions = {
        from: process.env.EMAIL_USER,
        to: customerEmail,
        subject: `Kiitos tilauksestasi!`,
        html: emailHtml,
      };

      // Send email
      await this.transporter.sendMail(mailOptions);
      console.log("Order confirmation email sent successfully");
    } catch (error) {
      throw new Error(`Failed to send confirmation email: ${error.message}`);
    }
  }
}

module.exports = new EmailService();
