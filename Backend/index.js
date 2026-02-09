import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import cookieParser from "cookie-parser";
import path from "path";
import authRoutes from "./src/routes/auth.routes.js";
import walletRoutes from "./src/routes/wallet.routes.js";
import usersRoutes from "./src/routes/users.routes.js";
import tradeRoutes from "./src/routes/trade.routes.js";
import bankRoutes from "./src/routes/bank.routes.js";
import cryptoRoutes from "./src/routes/crypto.routes.js";
import path from "path";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 3000;


// 🔥 REQUIRED FOR ES MODULE
const __dirname = path.resolve();

app.use(
  cors({
    origin: [
      "http://localhost:5173",
      "https://frontend.akritiarchitectsandengineers.com",
      "https://forex-1-r2jk.onrender.com",
      "https://www.tradebullforex.com"
    ], // frontend URL
    credentials: true, // allow cookies
    methods: ["GET", "POST", "PUT", "DELETE"],
    allowedHeaders: ["Content-Type", "Authorization"],
  }),
);

// ✅ ADD THESE TWO LINES
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.get("/", (req, res) => {
  res.send("Server is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/wallet", walletRoutes);
app.use("/api/user", usersRoutes);
app.use("/api/trade", tradeRoutes);
app.use("/api/bank", bankRoutes);
app.use("/api/crypto", cryptoRoutes);

///!SECTION for image get
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

// 🔥 SERVE FRONTEND
app.use(
  express.static(
    path.join(__dirname, "../Frontend/dist")
  )
);


// 🔥 CATCH-ALL (THIS FIXES 404 ON REFRESH)
app.get("*", (req, res) => {
  res.sendFile(
    path.join(__dirname, "../Frontend/dist/index.html")
  );
});


console.log(
  "Frontend path:",
  path.join(__dirname, "../Frontend/dist")
);


app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
