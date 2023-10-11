/*
Available Status Codes:
2xx Success
  200 - Standard response for successful HTTP requests
  201 - The request has been fulfilled [Add, Update, Delete]
  204 - The server successfully processed the request, and is not returning any content

4xx Client Errors
  400 - Bad request
  401 - Similar to 403 Forbidden, but specifically for use when authentication is required and has failed or has not yet been provided
  403 - Forbidden Request, The request contained valid data and was understood by the server, but the server is refusing action
  404 - The requested resource could not be found
  405 - A request method is not supported for the requested resource; for example, a GET request on a form that requires data to be presented via POST, or a PUT request on a read-only resource
  410 - Indicates that the resource requested was previously in use but is no longer available and will not be available again.
  412 - The server does not meet one of the preconditions that the requester put on the request header fields
  498 - Invalid Token
  499 - Token Required

5xx Server Errors
  521 - Web Server is Down  
  522 - Connection Time Out
  524 - A Timeout Occured
  599 - MySQL Syntax Error
*/
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
    key: config.passport.jwt.key,
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
