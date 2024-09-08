const express = require("express");
const colors = require("colors");
const dotenv = require("dotenv").config();
const PORT = process.env.PORT || 5000;
const cors = require("cors");
const connectDB = require("./config/db");
const path = require("path");

const app = express();
connectDB();

app.use(express.static(path.join(__dirname, "public")));

const corsOptions = { origins: [process.env.ALLOWED_ORIGIN] };
app.use(cors(corsOptions));

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api/auth", require("./routes/authRoutes"));

app.listen(PORT, () => console.log(`Server started on ${PORT} `));
