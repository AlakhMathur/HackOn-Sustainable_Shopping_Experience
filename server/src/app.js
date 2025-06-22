// Libraries
require('dotenv').config();
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
var path = require('path'); 
const http = require('http');


const port = process.env.PORT || 8000;
const app = express();

// socket connection
const { setUpsSockets } = require('./socket/socketconnection');
const ChatFunction = require('./socket/chat');
const { Notification } = require('./socket/notification');


const server = http.createServer(app);

setUpsSockets(server);

ChatFunction();
Notification();

// Database connection
const connectDB = require('./database/connection');
connectDB();

// Product Model
const Product = require('./models/Product');

// Routes
const router = require('./routes/router');

// Middleware
app.use(morgan('dev'));
app.use(express.json());
app.use(cookieParser(""));
const allowedOrigins = [
  'http://localhost:5173',
  'https://your-frontend-domain.vercel.app' // Replace with actual deployed frontend URL
];

app.use(cors({
  origin: function (origin, callback) {
    // allow requests with no origin (like mobile apps, curl, Postman)
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));

app.use('/api', router);

// For deployment
if (process.env.NODE_ENV === 'production') {
  app.use(express.static('frontend/build'));
  app.get("*", (req, res) => {
    res.sendFile(path.resolve(__dirname,  "frontend/build", "index.html"));
  });
}

// Server
server.listen(port, function() {
  console.log("Server started at port " + port);
})

