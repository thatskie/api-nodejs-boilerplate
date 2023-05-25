require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const apiRoutes = require('./routes/api.routes');

const app = express();
const PORT = process.env.PORT;

app.use(express.json());
app.use(
  express.urlencoded({
    extended: true,
  }),
);

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());
app.use(cors());

app.get('/', (req, res) => {
  res.json({ message: 'ok' });
});

app.use('/api', apiRoutes);
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

app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
