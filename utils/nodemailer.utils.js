const nodemailer = require('nodemailer');
const config = require('../config/configuration');

const transporter = nodemailer.createTransport({
  host: config.email.SMTPHost,
  port: config.email.SMTPPort,
  secure: config.email.SMTPSecure,
  auth: {
    user: config.email.SMTPUsername,
    pass: config.email.SMTPPassword,
  },
});

exports.sendEmail = (send_name, send_to, subject, message) => {
  return new Promise((resolve, reject) => {
    const email_message = {
      from: {
        name: config.email.SMTPName,
        address: config.email.SMTPUsername,
      },
      to: {
        name: send_name,
        address: send_to,
      },
      subject: subject,
      html: message,
    };

    transporter
      .sendMail(email_message)
      .then(() => {
        resolve(true);
      })
      .catch((error) => {
        // console.log(error);
        reject(false);
      });
  });
};
