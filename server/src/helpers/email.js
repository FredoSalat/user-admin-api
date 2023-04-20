const nodemailer = require("nodemailer");
const dev = require("../config");

const sendEmail = async (email) => {
  try {
    const transporter = nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: dev.app.nodeMailerUser,
        pass: dev.app.nodeMailerPass,
      },
    });
    const mailOptions = {
      from: dev.app.nodeMailerUser,
      to: email.email,
      subject: email.subject,
      html: email.html,
    };
    await transporter.sendMail(mailOptions, (error, info) => {
      if (error) {
        console.log("SMTP error");
        console.log(error);
      } else {
        console.log("Email sent: " + info.response);
        // do something useful
      }
    });
  } catch (error) {
    console.log("SMTP error 2");
    console.log(error);
  }
};

module.exports = sendEmail;
