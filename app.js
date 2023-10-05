require('dotenv').config();
//importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const apiRoutes = require('./routes/api.routes');
const PORT = process.env.PORT; // defining port of the server
// defining the Express app
const app = express();
app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);
app.use(helmet()); // adding Helmet to enhance your API's security
// using bodyParser to parse JSON bodies into JS objects
app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors()); // enabling CORS for all requests
app.use(morgan('combined')); // adding morgan to log HTTP requests
// defining an endpoint
app.get('/', (req, res) => {
  res.json({ message: 'ok' });
});
app.use('/api', apiRoutes); // declaring routes
/* Error handler middleware */
app.use((req, res, next) => {
  const error = new Error(404);
  next(error);
});
app.use((err, req, res, next) => {
  console.error(err.message, err.stack);
  const statusCode = err.message == 404 ? 404 : err.statusCode || 500;
  res.status(statusCode).json({
    status: statusCode,
    message: 'error',
    data: {
      'error message': err.message == 404 ? 'Request not found!' : err.message,
    },
  });
  return;
});
// starting the server
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
