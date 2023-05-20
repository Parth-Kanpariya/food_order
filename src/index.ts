import express from "express";
import App from "./services/ExpressApp";
import dbConnection from "./services/Database";

const PORT = 8000;

const startServer = async () => {
  const app = express();

  await dbConnection();

  await App(app);

  app.listen(PORT, () => {
    console.log("Listening to Port ", PORT);
  });
};

startServer();
