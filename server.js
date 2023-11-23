const express = require('express');
const app = express();
const bodyParser = require('body-parser');
const cors = require("cors");

// Import and use the binance controller file
require('./app/controllers/binance')

app.use(
    cors({
      credentials: true,
      origin: "http://localhost:3000",
    })
  );
  
  app.use(bodyParser.urlencoded({ extended: true }));
  // parse various different custom JSON types as JSON
  
  app.use(bodyParser.json())

// Express server setup
// set port, listen for requests
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});