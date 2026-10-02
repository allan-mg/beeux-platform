require("dotenv").config();

const express = require("express");
const mongoose = require("mongoose");

const routes = require("./routes");
const notFound = require("./middlewares/not-found");
const errorHandler = require("./middlewares/error-handler");

const app = express();

const PORT = process.env.PORT || 3000;

app.use(express.json());

app.use(routes);

app.use(notFound);
app.use(errorHandler);

mongoose
  .connect(process.env.MONGODB_URI)
  .then(() => {
    console.log("Connected to MongoDB");
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err);
  });

app.listen(PORT, () => {
  console.log(`BeeUX API running on port ${PORT}`);
});
