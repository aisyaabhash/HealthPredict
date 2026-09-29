const express = require("express");
const cors = require("cors");
require("dotenv").config();

const {
  initDb
} = require("./models/init");

const authRoute =
  require("./routes/auth");

const predictRoute =
  require("./routes/predict");

const historyRoute =
  require("./routes/history");


const app = express();

const port =
  process.env.PORT || 8080;


// ==========================================
// MIDDLEWARE
// ==========================================

app.use(
  cors({
    origin: true,
    credentials: true
  })
);

app.use(express.json());


// ==========================================
// ROUTES
// ==========================================

app.get("/", (req, res) => {

  res.json({
    message:
      "Diabetes & Heart Disease Prediction API",
    status: "running"
  });

});


app.get("/health", (req, res) => {

  res.json({
    status: "Node API is running"
  });

});


app.use(
  "/api/auth",
  authRoute
);

app.use(
  "/api/predict",
  predictRoute
);

app.use(
  "/api/history",
  historyRoute
);


// ==========================================
// START SERVER
// ==========================================

async function startServer() {

  try {

    await initDb();

    app.listen(
      port,
      () => {

        console.log(
          `Node server running on http://localhost:${port}`
        );

      }
    );

  } catch (err) {

    console.error(
      "Failed to start server:",
      err
    );

    process.exit(1);

  }

}


startServer();