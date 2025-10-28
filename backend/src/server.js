import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import routes from "./routes/index.js";
import { globalErrorHandler } from "./middlewares/errorHandler.js";
import { connectDB } from "./lib/db.js";






dotenv.config()
const app = express();
//middleares 
app.use(express.json())


app.use(cors());
app.use(express.json());


// 🚀 Mount all routes from index.js
app.use("/api", routes);

// invlid routes
app.all(/.*/, (req, res, next) => {
  next(new ApiError(404, `Route not found: ${req.originalUrl}`));
});

//error handler middleware
app.use(globalErrorHandler);

const PORT = process.env.PORT || 8080;
app.listen(PORT, ()=> {
    console.log("Server listening to :", PORT);
    connectDB()
})