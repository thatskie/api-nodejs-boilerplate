const emailParameter = {
  SMTPHost: process.env.SMTPHost,
  SMTPPort: process.env.SMTPPort,
  SMTPUsername: process.env.SMTPUsername,
  SMTPPassword: process.env.SMTPPassword,
  SMTPSecure: process.env.SMTPSecure == 0 ? false : true,
  SMTPName: process.env.SMTPName,
};
module.exports = emailParameter;
