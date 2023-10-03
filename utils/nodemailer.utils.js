const nodemailer = require('nodemailer');
const emailConfig = require('../config/emailConfig');

const transporter = nodemailer.createTransport({
  host: emailConfig.SMTPHost,
  port: emailConfig.SMTPPort,
  secure: emailConfig.SMTPSecure,
  auth: {
    user: emailConfig.SMTPUsername,
    pass: emailConfig.SMTPPassword,
  },
});

exports.sendEmail = (send_name, send_to, subject, message) => {
  return new Promise((resolve, reject) => {
    const email_message = {
      from: {
        name: emailConfig.SMTPName,
        address: emailConfig.SMTPUsername,
      },
      to: {
        name: send_name,
        address: send_to,
      },
      subject: subject,
      text: message,
    };

    transporter
      .sendMail(email_message)
      .then(() => {
        resolve(true);
      })
      .catch((error) => {
        console.log(error);
        reject(false);
      });
  });
};
