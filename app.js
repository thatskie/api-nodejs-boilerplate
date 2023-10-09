require('dotenv').config();
//importing the dependencies
const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
const apiRoutes = require('./routes/api.routes');
const passport = require('passport');
const session = require('express-session');
const cookieParser = require('cookie-parser');
const MySQLStore = require('express-mysql-session')(session);
const PORT = process.env.PORT; // defining port of the server
const config = require('./config/configuration');
// defining the Express app
const app = express();
require('./middleware/passport.middleware');
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
// defining Passport
app.use(passport.initialize());
// configure mysql session store
const MySQLOptions = {
  host: config.database.connection.host,
  port: config.database.connection.port,
  user: config.database.connection.user,
  password: config.database.connection.password,
  database: config.database.connection.schema,
  createDatabaseTable: false,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expire_at_dt',
      data: 'session_data',
    },
  },
};
const sessionStore = new MySQLStore(MySQLOptions);
// defining Session
app.use(
  session({
    key: 'servo-jwt',
    secret: config.passport.jwt.secret,
    resave: false,
    store: sessionStore,
    saveUninitialized: false,
    cookie: { maxAge: 1000 * 60 * 60 * 12 },
    // cookie: { secure: true, maxAge: 1000 * 60 * 60 * 24 },
  }),
);
app.use(passport.session());
// defining Cookie
app.use(cookieParser(config.passport.jwt.secret));
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
  // console.log(req);
  // console.log(req.isAuthenticated());
  // console.error(err.message, err.stack);
  if (!req.isAuthenticated()) {
    res.status(401).json({
      status: 401,
      message: 'error',
      data: {
        'error message': 'Restricted Access',
      },
    });
  } else {
    const statusCode = err.message == 404 ? 404 : err.statusCode || 500;
    res.status(statusCode).json({
      status: statusCode,
      message: 'error',
      data: {
        'error message':
          err.message == 404 ? 'Request not found!' : err.message,
      },
    });
  }
  return;
});
// starting the server
app.listen(PORT, () => {
  console.log(`Example app listening at http://localhost:${PORT}`);
});
