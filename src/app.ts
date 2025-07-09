import express from 'express';
import cors from 'cors';
import userRouter from "./router/user.route"
// import errorHandler from "./middleware/error.middleware";


const app = express()

// CORS configuration
app.use(cors({
    origin: "*",
    credentials: true,
    methods: ["POST", "GET"],
    allowedHeaders: ["Content-Type", "Authorization"],
}));

app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(express.static("public"));





//routes decleration
app.use("/api/v1/users", userRouter)

// // Error handler should be LAST
// app.use(errorHandler);

export default app;
