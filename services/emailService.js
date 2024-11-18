const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

const sendEmail = async (to, subject, text, html) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject,
    text, // Văn bản thuần (dùng cho email không hỗ trợ HTML)
    html, // Nội dung HTML
  };

  return transporter.sendMail(mailOptions);
};

module.exports = {
  sendEmail,
};
