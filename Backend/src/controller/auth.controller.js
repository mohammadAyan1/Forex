import bcrypt from "bcrypt";
import db from "../utils/db.js";
import { sendOTPEmail } from "../utils/sendMail.js";
import jwt from "jsonwebtoken";

const generateOTP = () => {
  return Math.floor(100000 + Math.random() * 900000);
};

export const login = async (req, res) => {
  // const db = db.promise();

  try {
    console.log(req?.body);
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Email and password are required",
      });
    }

    // 🔍 Find user
    const query = `
      SELECT id, name, email, password, role, is_verified,is_approved
      FROM users
      WHERE email = ?
    `;

    const [rows] = await db.execute(query, [email]);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    const user = rows[0];

    console.log(user);

    // ❌ Email not verified
    if (!user.is_verified) {
      return res.status(403).json({
        success: false,
        message: "Please verify your email first",
      });
    }

    if (!user.is_approved) {
      return res.status(403).json({
        success: false,
        message: "You Are not Verify by admin",
      });
    }

    // 🔐 Check password
    const isMatch = await bcrypt.compare(password, user.password);

    if (!isMatch) {
      return res.status(401).json({
        success: false,
        message: "Invalid email or password",
      });
    }

    // 🎫 Create JWT
    const token = jwt.sign(
      {
        id: user.id,
        role: user.role,
      },
      process.env.JWT_SECRET,
      {
        expiresIn: process.env.JWT_EXPIRES_IN,
      }
    );

    // 🍪 Store token in cookie
    // res.cookie("token", token, {
    //   httpOnly: true,
    //   secure: false, // set true in production (HTTPS)
    //   sameSite: "strict",
    //   maxAge: 24 * 60 * 60 * 1000, // 1 day
    // });


    res.cookie("token", token, {
      httpOnly: true,
      secure: true,          // ✅ REQUIRED on HTTPS
      sameSite: "none",      // ✅ REQUIRED for cross-site
      maxAge: 24 * 60 * 60 * 1000,
    });


    return res.status(200).json({
      success: true,
      message: "Login successful",
      data: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
      },
    });
  } catch (error) {
    console.error("Login Error:", error);

    return res.status(500).json({
      success: false,
      message: "Login failed",
    });
  }
};

export const logout = async (req, res) => {
  try {
    // ❌ Clear JWT cookie
    res.clearCookie("token", {
      httpOnly: true,
      secure: false, // true in production (HTTPS)
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error("Logout Error:", error);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};


export const register = async (req, res) => {
  const connection = await db.getConnection(); // ✅ NEW

  try {
    const {
      name,
      email,
      mobile,
      password,
      pan_number,
      aadhaar_number,
      bank_account_number,
      bank_ifsc_code,
      bank_branch,
      account_holder_name,
    } = req.body;

    // ✅ Extract images from multer
    const panImage = req.files?.pan_image?.[0]?.path || null;
    const aadhaarImage = req.files?.aadhaar_image?.[0]?.path || null;
    const passbookImage = req.files?.bank_passbook_image?.[0]?.path || null;

    // ✅ Basic validation
    if (
      !name ||
      !email ||
      !mobile ||
      !password ||
      !pan_number ||
      !aadhaar_number ||
      !bank_account_number ||
      !bank_ifsc_code ||
      !bank_branch ||
      !account_holder_name ||
      !panImage ||
      !aadhaarImage ||
      !passbookImage
    ) {
      return res.status(400).json({
        success: false,
        message: "All fields and images are required",
      });
    }

    // ✅ Check email OR mobile exists (use connection)
    const [existingUsers] = await connection.execute(
      `SELECT id FROM users WHERE email=? OR mobile=?`,
      [email, mobile]
    );

    if (existingUsers.length > 0) {
      return res.status(409).json({
        success: false,
        message: "Email or mobile already registered",
      });
    }

    // 🔐 Start transaction (on connection ✅)
    await connection.beginTransaction();

    // 🔐 Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // 🔢 OTP
    const otp = generateOTP();
    const otpExpiryTime = new Date(Date.now() + 5 * 60 * 1000);

    // ✅ Insert user
    const [userResult] = await connection.execute(
      `
      INSERT INTO users
      (name, email, mobile, password, otp, otp_time_limit)
      VALUES (?, ?, ?, ?, ?, ?)
      `,
      [name, email, mobile, hashedPassword, otp, otpExpiryTime]
    );

    const userId = userResult.insertId;

    // ✅ Insert documents
    await connection.execute(
      `
      INSERT INTO user_documents (
        user_id,
        pan_number,
        pan_image,
        aadhaar_number,
        aadhaar_image,
        bank_account_number,
        bank_ifsc_code,
        bank_branch,
        account_holder_name,
        bank_passbook_image
      )
      VALUES (?,?,?,?,?,?,?,?,?,?)
      `,
      [
        userId,
        pan_number,
        panImage,
        aadhaar_number,
        aadhaarImage,
        bank_account_number,
        bank_ifsc_code,
        bank_branch,
        account_holder_name,
        passbookImage,
      ]
    );

    // ✅ Commit transaction
    await connection.commit();

    // 📧 Send OTP (after commit ✅ best practice)
    await sendOTPEmail(
      email,
      "Email Verification OTP",
      `<h2>Email Verification</h2>
      <h1>${otp}</h1>
      <p>OTP valid for 5 minutes</p>
      `
    );

    return res.status(201).json({
      success: true,
      message: "Registered successfully. OTP sent.",
    });
  } catch (error) {
    await connection.rollback(); // ✅ rollback on connection
    console.error("Register Error:", error);

    return res.status(500).json({
      success: false,
      message: "Registration failed",
    });
  } finally {
    connection.release(); // ✅ MUST release connection
  }
};

export const verifyEmail = async (req, res) => {
  // const db = db.promise();

  try {
    const { email, otp } = req.body;

    if (!email || !otp) {
      return res.status(400).json({
        success: false,
        message: "Email and OTP are required",
      });
    }

    // 🔍 Check user
    const selectQuery = `
      SELECT id, otp, otp_time_limit, is_verified
      FROM users
      WHERE email = ?
    `;

    const [rows] = await db.execute(selectQuery, [email]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = rows[0];

    // ❌ Already verified
    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // ❌ OTP mismatch
    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ❌ OTP expired
    if (new Date(user.otp_time_limit) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // ✅ Verify user
    const updateQuery = `
      UPDATE users
      SET is_verified = true,
          otp = NULL,
          otp_time_limit = NULL
      WHERE id = ?
    `;

    await db.execute(updateQuery, [user.id]);

    return res.status(200).json({
      success: true,
      message: "Email verified successfully",
    });
  } catch (error) {
    console.error("Verify Email Error:", error);

    return res.status(500).json({
      success: false,
      message: "Email verification failed",
    });
  }
};

export const resendOTP = async (req, res) => {
  // const db = db.promise();

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // 🔍 Check user
    const selectQuery = `
      SELECT id, is_verified
      FROM users
      WHERE email = ?
    `;

    const [rows] = await db.execute(selectQuery, [email]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = rows[0];

    // ❌ Already verified
    if (user.is_verified) {
      return res.status(400).json({
        success: false,
        message: "Email already verified",
      });
    }

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiryTime = new Date(Date.now() + 5 * 60 * 1000);

    const html = `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for <b>5 minutes</b>.</p>
    `;

    // 🔄 Update OTP
    const updateQuery = `
      UPDATE users
      SET otp = ?, otp_time_limit = ?
      WHERE id = ?
    `;

    await db.execute(updateQuery, [otp, otpExpiryTime, user.id]);

    // 📧 Send OTP email
    await sendOTPEmail(email, "OTP Resend Successfully", html);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};

export const forgetResendOTP = async (req, res) => {
  // const db = db.promise();

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // 🔍 Check user
    const selectQuery = `
      SELECT id, is_verified
      FROM users
      WHERE email = ?
    `;

    const [rows] = await db.execute(selectQuery, [email]);

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = rows[0];

    // Generate new OTP
    const otp = generateOTP();
    const otpExpiryTime = new Date(Date.now() + 5 * 60 * 1000);

    const html = `
      <h2>Email Verification</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for <b>5 minutes</b>.</p>
    `;

    // 🔄 Update OTP
    const updateQuery = `
      UPDATE users
      SET otp = ?, otp_time_limit = ?
      WHERE id = ?
    `;

    await db.execute(updateQuery, [otp, otpExpiryTime, user.id]);

    // 📧 Send OTP email
    await sendOTPEmail(email, "OTP Resend Successfully", html);

    return res.status(200).json({
      success: true,
      message: "OTP resent successfully",
    });
  } catch (error) {
    console.error("Resend OTP Error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to resend OTP",
    });
  }
};

export const forgotPassword = async (req, res) => {
  // const db = db.promise();

  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({
        success: false,
        message: "Email is required",
      });
    }

    // 🔍 Check user
    const [rows] = await db.execute(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const otp = generateOTP();
    const otpExpiryTime = new Date(Date.now() + 5 * 60 * 1000);

    // 🔄 Update OTP
    await db.execute(
      `
      UPDATE users 
      SET otp = ?, otp_time_limit = ?
      WHERE email = ?
      `,
      [otp, otpExpiryTime, email]
    );

    const html = `
      <h2>Reset Password OTP</h2>
      <p>Your OTP is:</p>
      <h1>${otp}</h1>
      <p>This OTP is valid for <b>5 minutes</b>.</p>
    `;

    // 📧 Send OTP
    await sendOTPEmail(email, "Reset Password OTP", html);

    return res.status(200).json({
      success: true,
      message: "OTP sent to email",
    });
  } catch (error) {
    console.error("Forgot Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Failed to send OTP",
    });
  }
};

export const resetPassword = async (req, res) => {
  // const db = db.promise();

  try {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
      return res.status(400).json({
        success: false,
        message: "All fields are required",
      });
    }

    // 🔍 Get user
    const [rows] = await db.execute(
      `
      SELECT id, otp, otp_time_limit 
      FROM users 
      WHERE email = ?
      `,
      [email]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    const user = rows[0];

    // ❌ OTP mismatch
    if (String(user.otp) !== String(otp)) {
      return res.status(400).json({
        success: false,
        message: "Invalid OTP",
      });
    }

    // ❌ OTP expired
    if (new Date(user.otp_time_limit) < new Date()) {
      return res.status(400).json({
        success: false,
        message: "OTP expired",
      });
    }

    // 🔐 Hash new password
    const hashedPassword = await bcrypt.hash(newPassword, 10);

    // ✅ Update password & clear OTP
    await db.execute(
      `
      UPDATE users
      SET password = ?, otp = NULL, otp_time_limit = NULL
      WHERE id = ?
      `,
      [hashedPassword, user.id]
    );

    return res.status(200).json({
      success: true,
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset Password Error:", error);
    return res.status(500).json({
      success: false,
      message: "Password reset failed",
    });
  }
};

export const adminApprove = async (req, res) => {
  // ✅ Admin check
  if (req?.user?.role !== "admin") {
    return res.status(403).json({
      success: false,
      message: "Access denied: Admin only",
    });
  }

  // const db = db.promise();

  try {
    const { id } = req.params;

    if (!id) {
      return res.status(400).json({
        success: false,
        message: "User ID is required",
      });
    }

    // 🔍 Check user exists
    const [rows] = await db.execute(
      "SELECT id, is_approved FROM users WHERE id = ?",
      [id]
    );

    if (rows.length === 0) {
      return res.status(404).json({
        success: false,
        message: "User not found",
      });
    }

    // ❌ Already approved
    if (rows[0].is_approved) {
      return res.status(400).json({
        success: false,
        message: "User already approved",
      });
    }

    // ✅ Approve user
    await db.execute("UPDATE users SET is_approved = 1 WHERE id = ?", [
      id,
    ]);

    return res.status(200).json({
      success: true,
      message: "User approved successfully",
    });
  } catch (error) {
    console.error("Admin Approve Error:", error);
    return res.status(500).json({
      success: false,
      message: "User approval failed",
    });
  }
};
