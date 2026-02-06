import db from "../utils/db.js";
export const requestTopUp = async (req, res) => {
  // const db = db.promise();

  try {
    const userId = req.user.id;
    const { amount } = req.body;

    const paymentImage = req.file?.path;

    const parsedAmount = Number(amount);

    if (!parsedAmount || parsedAmount <= 0 || !paymentImage) {
      return res.status(400).json({
        success: false,
        message: "Valid amount and payment image are required",
      });
    }

    await db.execute(
      `
      INSERT INTO user_wallet_transactions
      (user_id, amount, transaction_type, payment_image)
      VALUES (?, ?, 'topup', ?)
      `,
      [userId, parsedAmount, paymentImage],
    );

    return res.status(201).json({
      success: true,
      message: "Top-up request submitted, pending approval",
    });
  } catch (error) {
    if (req.file?.path && fs.existsSync(req.file.path)) {
      fs.unlinkSync(req.file.path);
    }

    console.error("TopUp Error:", error);
    return res.status(500).json({
      success: false,
      message: "Top-up request failed",
    });
  }
};

export const requestWithdrawal = async (req, res) => {
  // const db = db.promise();

  try {
    const userId = req.user.id;
    const { amount } = req.body;

    if (!amount) {
      return res.status(400).json({
        success: false,
        message: "Amount is required",
      });
    }

    await db.execute(
      `
      INSERT INTO user_wallet_transactions
      (user_id, amount, transaction_type)
      VALUES (?, ?, 'withdrawal')
      `,
      [userId, amount],
    );

    return res.status(201).json({
      success: true,
      message: "Withdrawal request submitted, pending approval",
    });
  } catch (error) {
    console.error("Withdrawal Error:", error);
    return res.status(500).json({
      success: false,
      message: "Withdrawal request failed",
    });
  }
};

export const getWalletBalance = async (req, res) => {
  // const db = db.promise();
  const userId = req.user.id;

  const [rows] = await db.execute(
    `
    SELECT 
      SUM(
        CASE
          WHEN transaction_type IN ('topup','profit') AND status='approved' THEN amount
          WHEN transaction_type IN ('withdrawal','loss') AND status='approved' THEN -amount
          ELSE 0
        END
      ) AS balance
    FROM user_wallet_transactions
    WHERE user_id = ?
    `,
    [userId],
  );

  return res.json({
    success: true,
    balance: rows[0].balance || 0,
  });
};

export const getWalletLedger = async (req, res) => {
  // const db = db.promise();
  const userId = req.user.id;

  try {
    /* ================================
       1️⃣ FETCH ALL TRANSACTIONS
    ================================= */
    const [transactions] = await db.execute(
      `
      SELECT 
        id,
        transaction_type,
        amount,
        status,
        payment_image,
        admin_remark,
        created_at,
        approved_at,
        CASE
          WHEN transaction_type IN ('topup','profit') THEN amount
          WHEN transaction_type IN ('withdrawal','loss') THEN -amount
          ELSE 0
        END AS signed_amount
      FROM user_wallet_transactions
      WHERE user_id = ?
      ORDER BY created_at DESC
      `,
      [userId],
    );

    /* ================================
       2️⃣ CALCULATE TOTALS
    ================================= */
    let total_topup = 0;
    let total_withdrawal = 0;
    let total_profit = 0;
    let total_loss = 0;

    transactions.forEach((tx) => {
      if (tx.status !== "approved") return;

      switch (tx.transaction_type) {
        case "topup":
          total_topup += Number(tx.amount);
          break;
        case "withdrawal":
          total_withdrawal += Number(tx.amount);
          break;
        case "profit":
          total_profit += Number(tx.amount);
          break;
        case "loss":
          total_loss += Number(tx.amount);
          break;
      }
    });

    const final_balance =
      total_topup + total_profit - total_withdrawal - total_loss;

    /* ================================
       3️⃣ RESPONSE (TABLE READY)
    ================================= */
    return res.json({
      success: true,
      summary: {
        total_topup,
        total_withdrawal,
        total_profit,
        total_loss,
        final_balance,
      },
      table: transactions,
    });
  } catch (error) {
    console.error("Wallet Ledger Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch wallet ledger",
    });
  }
};

///!SECTION ADMIN ///!SECTION
export const adminApproveReject = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin access only",
    });
  }

  // const db = db.promise();
  const { id } = req.params;
  const { status, remark } = req.body;

  if (!["approved", "rejected"].includes(status)) {
    return res.status(400).json({
      success: false,
      message: "Invalid status",
    });
  }

  await db.execute(
    `
    UPDATE user_wallet_transactions
    SET status=?, admin_remark=?, approved_by=?, approved_at=NOW()
    WHERE id=?
    `,
    [status, remark || null, req.user.id, id],
  );

  return res.json({
    success: true,
    message: `Transaction ${status}`,
  });
};

export const adminProfitLoss = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin only",
    });
  }

  // const db = db.promise();
  const { user_id, amount, type, remark } = req.body;

  if (!user_id || !amount || !["profit", "loss"].includes(type)) {
    return res.status(400).json({
      success: false,
      message: "Invalid input",
    });
  }

  await db.execute(
    `
    INSERT INTO user_wallet_transactions
    (user_id, amount, transaction_type, status, admin_remark, approved_by, approved_at)
    VALUES (?, ?, ?, 'approved', ?, ?, NOW())
    `,
    [user_id, amount, type, remark || null, req.user.id],
  );

  return res.json({
    success: true,
    message: `${type} added successfully`,
  });
};

export const getPendingWalletRequests = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin only",
    });
  }

  // SELECT *
  //   FROM user_wallet_transactions
  //   WHERE status='pending'
  //   ORDER BY created_at DESC
  // const db = db.promise();

  const [rows] = await db.execute(
    `
    SELECT 
    uwt.*, 
    u.id AS user_id,
    u.name,
    u.email
FROM user_wallet_transactions AS uwt
INNER JOIN users AS u ON u.id = uwt.user_id
WHERE uwt.status = 'pending'
ORDER BY uwt.created_at DESC;

    `,
  );

  return res.json({
    success: true,
    data: rows,
  });
};

export const adminUserWalletOverview = async (req, res) => {
  if (req.user.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Admin only",
    });
  }

  // const db = db.promise();

  try {
    /* =====================================================
       1️⃣ FETCH ALL USERS
    ===================================================== */
    const [users] = await db.execute(`
      SELECT id, name, email, mobile,actual_password
      FROM users
      WHERE role = 'user'
      ORDER BY created_at DESC
    `);

    /* =====================================================
       2️⃣ FETCH ALL APPROVED TRANSACTIONS
    ===================================================== */
    const [transactions] = await db.execute(`
      SELECT 
        uwt.id,
        uwt.user_id,
        uwt.transaction_type,
        uwt.amount,
        uwt.status,
        uwt.created_at,
        u.name,
        u.email,
        u.actual_password
      FROM user_wallet_transactions uwt
      JOIN users u ON u.id = uwt.user_id
      WHERE uwt.status = 'approved'
      ORDER BY uwt.created_at DESC
    `);

    /* =====================================================
       3️⃣ PREPARE OVERALL TOTALS
    ===================================================== */
    let overall = {
      total_users: users.length,
      total_topup: 0,
      total_withdrawal: 0,
      total_profit: 0,
      total_loss: 0,
      system_balance: 0,
    };

    /* =====================================================
       4️⃣ MAP USER DATA
    ===================================================== */
    const userMap = {};

    users.forEach((user) => {
      userMap[user.id] = {
        user_id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        password: user.actual_password,
        totals: {
          topup: 0,
          withdrawal: 0,
          profit: 0,
          loss: 0,
          balance: 0,
        },
        transactions: [],
      };
    });

    /* =====================================================
       5️⃣ PROCESS TRANSACTIONS
    ===================================================== */
    transactions.forEach((tx) => {
      const user = userMap[tx.user_id];
      if (!user) return;

      const amount = Number(tx.amount);

      switch (tx.transaction_type) {
        case "topup":
          user.totals.topup += amount;
          overall.total_topup += amount;
          break;

        case "withdrawal":
          user.totals.withdrawal += amount;
          overall.total_withdrawal += amount;
          break;

        case "profit":
          user.totals.profit += amount;
          overall.total_profit += amount;
          break;

        case "loss":
          user.totals.loss += amount;
          overall.total_loss += amount;
          break;
      }

      user.transactions.push({
        id: tx.id,
        type: tx.transaction_type,
        amount: amount,
        date: tx.created_at,
      });
    });

    /* =====================================================
       6️⃣ CALCULATE BALANCES
    ===================================================== */
    Object.values(userMap).forEach((user) => {
      user.totals.balance =
        user.totals.topup +
        user.totals.profit -
        user.totals.withdrawal -
        user.totals.loss;

      overall.system_balance += user.totals.balance;
    });

    /* =====================================================
       7️⃣ FINAL RESPONSE
    ===================================================== */
    return res.json({
      success: true,
      overall_summary: overall,
      users: Object.values(userMap),
    });
  } catch (error) {
    console.error("Admin Wallet Overview Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin wallet overview",
    });
  }
};

export const adminUserWalletOverviewSuperAdmin = async (req, res) => {
  // const db = db.promise();

  try {
    /* =====================================================
       1️⃣ FETCH ALL USERS
    ===================================================== */
    const [users] = await db.execute(`
      SELECT id, name, email, mobile,actual_password,role
      FROM users
      WHERE role = 'user'
      ORDER BY created_at DESC
    `);

    /* =====================================================
       2️⃣ FETCH ALL APPROVED TRANSACTIONS
    ===================================================== */
    const [transactions] = await db.execute(`
      SELECT 
        uwt.id,
        uwt.user_id,
        uwt.transaction_type,
        uwt.amount,
        uwt.status,
        uwt.created_at,
        u.name,
        u.email,
        u.actual_password,
        u.role
      FROM user_wallet_transactions uwt
      JOIN users u ON u.id = uwt.user_id
      WHERE uwt.status = 'approved'
      ORDER BY uwt.created_at DESC
    `);

    /* =====================================================
       3️⃣ PREPARE OVERALL TOTALS
    ===================================================== */
    let overall = {
      total_users: users.length,
      total_topup: 0,
      total_withdrawal: 0,
      total_profit: 0,
      total_loss: 0,
      system_balance: 0,
    };

    /* =====================================================
       4️⃣ MAP USER DATA
    ===================================================== */
    const userMap = {};

    users.forEach((user) => {
      userMap[user.id] = {
        user_id: user.id,
        name: user.name,
        email: user.email,
        mobile: user.mobile,
        role: user.role,
        password: user.actual_password,
        totals: {
          topup: 0,
          withdrawal: 0,
          profit: 0,
          loss: 0,
          balance: 0,
        },
        transactions: [],
      };
    });

    /* =====================================================
       5️⃣ PROCESS TRANSACTIONS
    ===================================================== */
    transactions.forEach((tx) => {
      const user = userMap[tx.user_id];
      if (!user) return;

      const amount = Number(tx.amount);

      switch (tx.transaction_type) {
        case "topup":
          user.totals.topup += amount;
          overall.total_topup += amount;
          break;

        case "withdrawal":
          user.totals.withdrawal += amount;
          overall.total_withdrawal += amount;
          break;

        case "profit":
          user.totals.profit += amount;
          overall.total_profit += amount;
          break;

        case "loss":
          user.totals.loss += amount;
          overall.total_loss += amount;
          break;
      }

      user.transactions.push({
        id: tx.id,
        type: tx.transaction_type,
        amount: amount,
        date: tx.created_at,
      });
    });

    /* =====================================================
       6️⃣ CALCULATE BALANCES
    ===================================================== */
    Object.values(userMap).forEach((user) => {
      user.totals.balance =
        user.totals.topup +
        user.totals.profit -
        user.totals.withdrawal -
        user.totals.loss;

      overall.system_balance += user.totals.balance;
    });

    /* =====================================================
       7️⃣ FINAL RESPONSE
    ===================================================== */
    return res.json({
      success: true,
      overall_summary: overall,
      users: Object.values(userMap),
    });
  } catch (error) {
    console.error("Admin Wallet Overview Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to fetch admin wallet overview",
    });
  }
};
