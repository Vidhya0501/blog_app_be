import express from "express";
import dotenv from "dotenv";
import cors from "cors";

import Router from "./routes/route.js";

dotenv.config();

const app = express();

app.use(express.json());
app.use(cors());

app.use("/", Router);

const PORT = process.env.PORT || 8000;

app.listen(PORT, () =>
  console.log(`Server is running successfully on PORT ${PORT}`)
);
