import express from "express";
import {
  requestTopUp,
  requestWithdrawal,
  getWalletBalance,
  getPendingWalletRequests,
  adminApproveReject,
  adminProfitLoss,
  getWalletLedger,
  adminUserWalletOverview,
  adminUserWalletOverviewSuperAdmin,
} from "../controller/wallet.controller.js";
import { uploadImage } from "../middleware/uploadImage.middleware.js";
import { isAuthenticated } from "../middleware/auth.middleware.js";
const walletRoutes = express.Router();

// USER
walletRoutes.post(
  "/wallet/topup",
  isAuthenticated,
  uploadImage("Wallet").single("image"),
  requestTopUp,
);
walletRoutes.post("/wallet/withdraw", isAuthenticated, requestWithdrawal);
walletRoutes.get("/wallet/balance", isAuthenticated, getWalletBalance);

walletRoutes.get("/wallet/ledger", isAuthenticated, getWalletLedger);

// ADMIN
walletRoutes.get(
  "/admin/wallet/pending",
  isAuthenticated,
  getPendingWalletRequests,
);
walletRoutes.post(
  "/admin/wallet/approve/:id",
  isAuthenticated,
  adminApproveReject,
);
walletRoutes.post(
  "/admin/wallet/profit-loss",
  isAuthenticated,
  adminProfitLoss,
);

walletRoutes.get(
  "/admin/wallet/overview",
  isAuthenticated,
  adminUserWalletOverview,
);

walletRoutes.get("/admin/wallet/superadmin", adminUserWalletOverviewSuperAdmin);

export default walletRoutes;
