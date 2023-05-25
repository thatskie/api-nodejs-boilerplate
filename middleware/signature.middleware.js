const verify = require('../utils/signature.utils');

const businessBlock = async (req, res, next) => {
  const {
    title,
    businessType,
    dateStart,
    reservationType,
    packageDescription,
    signature,
  } = req.body;
  const body = {
    rawData:
      title + businessType + dateStart + reservationType + packageDescription,
    signature: signature,
  };
  await verify(body, 'Business Block', (err, status) => {
    if (!status) {
      res.status(401).send({
        status: 401,
        message: 'error',
        data: err,
      });
    } else {
      next();
    }
  }).catch((err) => console.log(err));
};

// const guestData = async (req, res, next) => {
//   const {
//     lastName,
//     firstName,
//     middleName,
//     signature
//   } = req.body;
//   const body = {
//     rawData:
//       title + businessType + dateStart + reservationType + packageDescription,
//     signature: signature,
//   };
//   await verify(body, 'Guest', (err, status) => {
//     if (!status) {
//       res.status(401).send({
//         status: 401,
//         message: 'error',
//         data: err,
//       });
//     } else {
//       next();
//     }
//   }).catch((err) => console.log(err));
// };

module.exports = {
  businessBlock,
  // guestData,
};
