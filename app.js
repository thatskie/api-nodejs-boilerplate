const { request } = require('https');
/*
This file contains the configuration and setup for an Express.js server utilizing 
various middleware and handling different HTTP status codes. 
It sets up endpoints, handles API requests, and implements error handling


Suggested Status Codes:
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
require('dotenv').config() /* Loads environment variables from a .env file */;
//importing the dependencies
const express = require('express') /* Node.js middleware for server setup */,
  bodyParser = require('body-parser') /* Node.js middleware for server setup */,
  cors = require('cors') /* Node.js middleware for server setup */,
  helmet = require('helmet') /* Node.js middleware for server setup */,
  morgan = require('morgan') /* Node.js middleware for server setup */,
  apiRoutes = require('./routes/api.routes') /* imports and assigns the functionality and route definitions defined in the api.routes.js file/module. It is commonly used in Node.js/Express applications to manage and organize API-related routes separately from the main application logic */,
  session = require('express-session') /* Provides session middleware for Express */,
  passport = require('passport') /* Authentication middleware for Node.js */,
  MySQLStore = require('express-mysql-session')(
    session,
  ) /* Sets up a MySQL session store for managing session data */,
  PORT = process.env.PORT /* defining port of the server */,
  config = require('./config/configuration') /* import configuration file */,
  app = express() /* defining the Express app */,
  flash = require('connect-flash'),
  logger = require('./utils/logger.utils')
  logger.require("System Running in " + (config.isDevelopment === true ? "Development" : "Production") + " mode");
app.use(
  express.json(),
); /* This line of code configures the Express application (app) to use the built-in middleware express.json(). This middleware is responsible for parsing incoming JSON data from client requests */
app.use(
  express.urlencoded({
    extended: true,
  }),
); /* This line of code configures the Express application (app) to use the built-in middleware express.urlencoded(). This middleware is used to parse incoming request bodies with URL-encoded payloads. */
app.use(
  helmet(),
); /* This line of code adds the helmet middleware to the Express application (app). Helmet is a collection of middleware functions for securing Express apps by setting various HTTP headers */
app.use(
  bodyParser.urlencoded({ extended: false }),
) /* This line of code configures the Express application (app) to use the body-parser middleware with specific settings for handling URL-encoded data. The body-parser package allows parsing of incoming request bodies in different formats, and in this case, it focuses on URL-encoded data */;
app.use(bodyParser.json());
//enabling CORS for all requests
app.use(
  cors({
    credentials: true,
    origin: [
      'http://127.0.0.1:5173',
      'https://servopms.servocloud.solutions',
      'https://qa.servoit.solutions',
      'https://dev.servoit.solutions',
      'https://uat.servoit.solutions',
    ],
    preflightContinue: true,
    optionsSuccessStatus: 204,
  }),
);
app.use(morgan('combined')); // adding morgan to log HTTP requests
// configuration for mysql session store
const MySQLOptions = {
  host: config.database.connection.host,
  port: config.database.connection.port,
  user: config.database.connection.user,
  password: config.database.connection.password,
  database: config.database.connection.schema,
  createDatabaseTable: false,
  checkExpirationInterval: 900000,
  expiration: 1000 * 60 * 60 * 12,
  clearExpired: true,
  schema: {
    tableName: 'sessions',
    columnNames: {
      session_id: 'session_id',
      expires: 'expire_at_dt',
      data: 'session_data',
    },
  },
};
// defining Cookie
// app.use(cookieParser());
// configuration for session
app.use(
  session({
    key: config.passport.jwt.key,
    secret: config.passport.jwt.secret,
    resave: false,
    store: new MySQLStore(MySQLOptions),
    proxy: true,
    saveUninitialized: false,
    cookie: config.isDevelopment
      ? { maxAge: 1000 * 60 * 60 * 12 }
      : config.passport.jwt.cookie,
  }),
);
// defining Passport
// app.set('trust proxy', 1);
app.use(passport.session());
app.use(passport.initialize());
app.use(flash());
require('./middleware/passport.middleware');
// defining an endpoint
app.get('/', (req, res) => {
  res.json({ message: 'ok', buildVersion: config.apiVersion });
});
app.use('/api', apiRoutes); // declaring routes
/* Error handler middleware */
app.use((req, res, next) => {
  const error = new Error(404);
  next(error);
});
app.use((err, req, res, next) => {
  const statusCode = err.message == 404 ? 404 : err.statusCode || 500;
  const errors = new Array();
  errors.push({
    error: {
      remarks: statusCode === 400 ? 'Request not found!' : err.message,
    },
  });
  res.status(statusCode).json({
    status: statusCode,
    message: 'error',
    data: {
      error_message: 'System Error',
      level: 0,
      errors,
    },
  });
  return;
});
// starting the server
app.listen(PORT, () => {
  logger.require(`App listening at http://localhost:${PORT}`);
});
