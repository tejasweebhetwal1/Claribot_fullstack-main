const nodemailer = require("nodemailer");
const express = require("express");
const cors = require("cors");
const fs = require("fs");
const path = require("path");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
require("dotenv").config();

const app = express();

app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  })
);

app.use(express.json());

const DB_PATH = path.join(__dirname, "data", "db.json");

function readDB() {
  const db = JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));

  db.users = db.users || [];
  db.conversations = db.conversations || [];
  db.leads = db.leads || [];
  db.otps = db.otps || [];
  db.orders = db.orders || [];

  return db;
}

function writeDB(data) {
  fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

function createToken(user) {
  return jwt.sign(
    { id: user.id, email: user.email, role: user.role },
    process.env.JWT_SECRET || "claribot_secret_key",
    { expiresIn: "1d" }
  );
}
async function sendOtpEmail(toEmail, otp) {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("Email sender is not configured");
  }

  const transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  await transporter.sendMail({
    from: `"ClariBot Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject: "Your ClariBot Verification Code",
    text: `Your ClariBot OTP is ${otp}. This code is valid for 10 minutes.`,
    html: `
      <div style="font-family: Arial, sans-serif; background:#f7f2ff; padding:24px;">
        <div style="max-width:520px; margin:auto; background:white; border-radius:16px; padding:28px;">
          <h2 style="color:#7c3aed;">ClariBot Email Verification</h2>
          <p>Use this verification code to complete your account registration:</p>
          <div style="font-size:32px; font-weight:bold; letter-spacing:8px; color:#7c3aed; background:#f3e8ff; padding:16px; border-radius:12px; text-align:center;">
            ${otp}
          </div>
          <p>This OTP is valid for 10 minutes.</p>
          <p>If you did not request this code, please ignore this email.</p>
          <p>Regards,<br/>ClariBot Support Team</p>
        </div>
      </div>
    `,
  });
}

function normalizeEmail(email) {
  return String(email || "").toLowerCase().trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

// Business chatbot reply logic
function getBotReply(userText) {
  const msg = (userText || "").toLowerCase();
    if (msg.includes("honey")) {
    return "Yes, we sell Flower Honey 1kg for $10. You can find it in the Breakfast category.";
  }

  if (msg.includes("tahini")) {
    return "Yes, we sell Premium Pure Tahini 750g for $10.50. It is available in the Pantry category.";
  }

  if (msg.includes("sucuk") || msg.includes("meat")) {
    return "Yes, we sell Halal Beef Sucuk 500g for $13.60.";
  }

  if (msg.includes("chocolate")) {
    return "Yes, we sell Dubai Pistachio Chocolate for $16.15.";
  }

  if (msg.includes("halal")) {
    return "Yes, many of our products are halal, including Halal Beef Sucuk and selected pantry items.";
  }

  if (msg.includes("delivery") || msg.includes("shipping")) {
    return "We offer local delivery. Delivery is free for orders over $50, otherwise it is $8.99.";
  }

  if (msg.includes("payment") || msg.includes("card") || msg.includes("checkout")) {
    return "This website uses demo checkout only. Customers can enter fake card details, but no real money is deducted.";
  }

  if (msg.includes("refund") || msg.includes("return")) {
    return "Refunds can be requested within 7 days. Please provide your demo order number and reason for the return.";
  }

  if (msg.includes("open") || msg.includes("hours") || msg.includes("close")) {
    return "ClariMart is open Monday to Saturday from 9:00 AM to 6:00 PM.";
  }

  const products = `
1. Starter Plan — $0/month
Best for testing. Includes basic chatbot replies, lead capture, and 1,000 monthly conversations.

2. Growth Plan — $99/month
Best for small businesses. Includes 20,000 conversations, admin dashboard, analytics, conversation history, and priority support.

3. Enterprise Plan — $299/month
Best for larger businesses. Includes unlimited conversations, custom AI training, advanced support, SLA support, and white-label option.

4. Custom Chatbot Setup — From $499 one-time
Includes chatbot setup, business FAQ training, support flow setup, and website integration.

5. AI Knowledge Base Setup — From $199 one-time
Includes adding product details, pricing, refund policy, delivery details, opening hours, and business FAQs.
`;

  // Greetings
  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hello! 👋 I’m ClariBot, your AI customer support assistant. You can ask me about products, prices, delivery, refund policy, opening hours, or account support.";
  }

  // Specific plan answers FIRST
  if (msg.includes("starter")) {
    return "The **Starter Plan** costs **$0/month**. It is best for testing or small demo use. It includes basic chatbot replies, lead capture, and 1,000 monthly conversations.";
  }

  if (msg.includes("growth")) {
    return "The **Growth Plan** costs **$99/month**. It is best for small businesses. It includes 20,000 monthly conversations, admin dashboard, analytics, conversation history, and priority support.";
  }

  if (msg.includes("enterprise")) {
    return "The **Enterprise Plan** costs **$299/month**. It is best for larger businesses. It includes unlimited conversations, custom AI training, advanced support, SLA support, and white-label option.";
  }

  // Best plan recommendation
  if (
    msg.includes("best") ||
    msg.includes("recommend") ||
    msg.includes("which plan") ||
    msg.includes("small business")
  ) {
    return "For most small businesses, I recommend the **Growth Plan** at **$99/month**. It includes 20,000 monthly conversations, admin dashboard, analytics, conversation history, and priority support. If you only want to test the chatbot, the Starter Plan is enough.";
  }

  // Product/service list
  if (
    msg.includes("product") ||
    msg.includes("products") ||
    msg.includes("service") ||
    msg.includes("services") ||
    msg.includes("offer") ||
    msg.includes("what do you sell")
  ) {
    return `We offer AI customer support products and services:\n\n${products}`;
  }

  // Generic pricing
  if (
    msg.includes("price") ||
    msg.includes("pricing") ||
    msg.includes("cost") ||
    msg.includes("fee") ||
    msg.includes("how much") ||
    msg.includes("plans")
  ) {
    return `Here is our pricing:\n\n${products}\nFor most small businesses, the **Growth Plan** at **$99/month** is the best option.`;
  }

  // Opening hours
  if (
    msg.includes("opening") ||
    msg.includes("opening time") ||
    msg.includes("opening hours") ||
    msg.includes("business hours") ||
    msg.includes("open time") ||
    msg.includes("what time") ||
    msg.includes("close") ||
    msg.includes("closing") ||
    msg.includes("hours")
  ) {
    return "Our opening hours are **Monday to Friday, 9:00 AM to 5:00 PM**. We are closed on weekends and public holidays. The chatbot is available 24/7 for basic support.";
  }

  // Delivery
  if (
    msg.includes("delivery") ||
    msg.includes("deliver") ||
    msg.includes("shipping") ||
    msg.includes("ship")
  ) {
    return "Yes, we provide digital delivery for chatbot services. After signup, the chatbot can be integrated into the business website. Setup time depends on the selected plan and business requirements.";
  }

  // Refund
  if (
    msg.includes("refund") ||
    msg.includes("return") ||
    msg.includes("money back") ||
    msg.includes("cancel") ||
    msg.includes("cancellation")
  ) {
    return "Refund requests are reviewed by our support team. Please provide your registered email, order or plan details, payment date, and reason for refund. If the service has not been used or the issue is valid, the support team may approve a refund according to business policy.";
  }

  // Further details
  if (
    msg.includes("further") ||
    msg.includes("detail") ||
    msg.includes("details") ||
    msg.includes("more information") ||
    msg.includes("explain") ||
    msg.includes("tell me more")
  ) {
    return "ClariBot is an AI customer support platform for business websites. It helps customers ask questions about products, prices, delivery, refunds, opening hours, and support. It includes a business landing page, account registration, ChatGPT-like chatbot UI, lead capture, conversation history, OTP verification, and admin dashboard.";
  }

  // Contact/support
  if (
    msg.includes("contact") ||
    msg.includes("phone") ||
    msg.includes("call") ||
    msg.includes("email") ||
    msg.includes("support") ||
    msg.includes("help")
  ) {
    return "You can contact our support team by email at **support@claribot.com**. Business support is available Monday to Friday, 9:00 AM to 5:00 PM. You can also continue asking questions here.";
  }

  // Payment/billing
  if (
    msg.includes("payment") ||
    msg.includes("pay") ||
    msg.includes("invoice") ||
    msg.includes("billing")
  ) {
    return "For billing and payments, customers can choose a monthly plan and receive invoice details through their business account. If you need billing help, please provide your registered email and plan name.";
  }

  // Admin/dashboard
  if (
    msg.includes("admin") ||
    msg.includes("dashboard") ||
    msg.includes("analytics")
  ) {
    return "The admin dashboard allows business staff to view users, leads, conversations, chatbot activity, and customer support performance.";
  }

  // Thanks
  if (msg.includes("thank") || msg.includes("thanks")) {
    return "You’re welcome! I’m happy to help.";
  }

  return "Thanks for reaching out! I can help with products, prices, delivery, refunds, opening hours, account support, and further business details. What would you like to know?";
}

app.get("/", (req, res) => {
  res.send("ClariBot backend is running");
});

// Admin login
app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (email !== "admin@claribot.com" || password !== "admin123") {
    return res.status(401).json({ message: "Invalid admin credentials" });
  }

  const admin = {
    id: "admin-1",
    name: "Admin",
    email,
    role: "admin",
  };

  res.json({
    message: "Admin login successful",
    token: createToken(admin),
    user: admin,
  });
});

// Request OTP for customer signup
app.post("/api/auth/request-otp", async (req, res) => {
  try {
    const db = readDB();
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({ message: "Email is required" });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    const existingUser = db.users.find(
      (u) => normalizeEmail(u.email) === email && u.role === "customer"
    );

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    const otp = Math.floor(100000 + Math.random() * 900000).toString();

    db.otps = db.otps || [];
    db.otps = db.otps.filter((item) => item.email !== email);

    db.otps.push({
      email,
      otp,
      expiresAt: Date.now() + 10 * 60 * 1000,
      createdAt: new Date().toISOString(),
    });

    writeDB(db);

    await sendOtpEmail(email, otp);

    console.log("\n======================================");
    console.log("CLARIBOT OTP EMAIL SENT");
    console.log(`Email: ${email}`);
    console.log(`OTP: ${otp}`);
    console.log("Valid for: 10 minutes");
    console.log("======================================\n");

    res.json({
      ok: true,
      message: "OTP sent to your email successfully.",
    });
  } catch (error) {
    console.error("Request OTP error:", error);

    res.status(500).json({
      ok: false,
      message: "Failed to send OTP email. Please check email configuration.",
      error: error.message,
    });
  }
});

// Customer signup with OTP
app.post("/api/auth/signup", async (req, res) => {
  try {
    const db = readDB();

    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    const otp = String(req.body.otp || "").trim();

    if (!name || !email || !password || !otp) {
      return res.status(400).json({
        message: "Full name, email, password and OTP are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({ message: "Please enter a valid email address" });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = db.users.find(
      (u) => normalizeEmail(u.email) === email && u.role === "customer"
    );

    if (existingUser) {
      return res.status(409).json({ message: "User already exists" });
    }

    const otpRecord = db.otps.find(
      (item) => item.email === email && item.otp === otp
    );

    if (!otpRecord) {
      return res.status(400).json({ message: "Invalid OTP" });
    }

    if (Date.now() > otpRecord.expiresAt) {
      db.otps = db.otps.filter((item) => item.email !== email);
      writeDB(db);

      return res.status(400).json({
        message: "OTP has expired. Please request a new OTP.",
      });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = {
      id: Date.now().toString(),
      name,
      email,
      password: hashedPassword,
      role: "customer",
      emailVerified: true,
      createdAt: new Date().toISOString(),
    };

    db.users.push(user);
    db.otps = db.otps.filter((item) => item.email !== email);

    writeDB(db);

    res.status(201).json({
      message: "Signup successful",
      token: createToken(user),
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        emailVerified: true,
      },
    });
  } catch (error) {
    console.error("Signup error:", error);
    res.status(500).json({
      message: "Signup failed",
    });
  }
});

// Customer login
app.post("/api/auth/login", async (req, res) => {
  const email = normalizeEmail(req.body.email);
  const password = String(req.body.password || "");

  const db = readDB();

  const user = db.users.find(
    (u) => normalizeEmail(u.email) === email && u.role === "customer"
  );

  if (!user) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  const passwordMatch = await bcrypt.compare(password, user.password);

  if (!passwordMatch) {
    return res.status(401).json({ message: "Invalid email or password" });
  }

  res.json({
    message: "Login successful",
    token: createToken(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified || false,
    },
  });
});

// Admin summary
app.get("/api/admin/summary", (req, res) => {
  const db = readDB();

  res.json({
    totalUsers: db.users.length,
    totalConversations: db.conversations.length,
    resolutionRate: 94,
    escalated: 0,
    leadsCaptured: db.leads.length,
    avgResponse: "< 1s",
  });
});

// Admin settings
app.get("/api/admin/settings", (req, res) => {
  res.json({
    botName: "ClariBot",
    supportEmail: "support@claribot.com",
    status: "active",
  });
});

// Get all customer conversations
app.get("/api/conversations", (req, res) => {
  const db = readDB();

  const conversations = db.conversations
    .map((c) => ({
      ...c,
      updatedAt: c.updatedAt || c.createdAt,
    }))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  res.json(conversations);
});

// Create new conversation
app.post("/api/conversations", (req, res) => {
  const db = readDB();

  const nowTime = new Date().toISOString();

  const conversation = {
    id: Date.now().toString(),
    userId: req.body.userId || "guest",
    title: req.body.title || "New conversation",
    status: "open",
    sentiment: "neutral",
    messages: [
      {
        id: Date.now().toString(),
        role: "bot",
        text: "Hello! 👋 I’m ClariBot, your AI customer support assistant. You can ask me about products, prices, delivery, refunds, opening hours, or account support.",
        createdAt: nowTime,
      },
    ],
    createdAt: nowTime,
    updatedAt: nowTime,
  };

  db.conversations.push(conversation);
  writeDB(db);

  res.status(201).json(conversation);
});

// Send message to conversation
app.post("/api/conversations/:id/messages", (req, res) => {
  const db = readDB();

  const conversation = db.conversations.find((c) => c.id === req.params.id);

  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const text = req.body.text || "";
  const nowTime = new Date().toISOString();

  const userMessage = {
    id: Date.now().toString(),
    role: "user",
    text,
    createdAt: nowTime,
  };

  const botMessage = {
    id: (Date.now() + 1).toString(),
    role: "bot",
    text: getBotReply(text),
    createdAt: new Date().toISOString(),
  };

  conversation.messages.push(userMessage, botMessage);
  conversation.updatedAt = new Date().toISOString();

  if (conversation.title === "New conversation" && text.trim()) {
    conversation.title =
      text.length > 28 ? text.slice(0, 28) + "..." : text;
  }

  writeDB(db);

  res.json({
    userMessage,
    botMessage,
    reply: botMessage,
    conversation,
  });
});

// Admin get all conversations
app.get("/api/admin/conversations", (req, res) => {
  const db = readDB();

  const conversations = db.conversations
    .map((c) => ({
      ...c,
      sentiment: c.sentiment || "neutral",
      status: c.status || "open",
      messageCount: c.messages ? c.messages.length : 0,
      updatedAt: c.updatedAt || c.createdAt,
    }))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  res.json(conversations);
});

// Admin chat logs
app.get("/api/admin/chat-logs", (req, res) => {
  const db = readDB();

  const logs = db.conversations
    .map((c) => ({
      ...c,
      sentiment: c.sentiment || "neutral",
      status: c.status || "open",
      messageCount: c.messages ? c.messages.length : 0,
      updatedAt: c.updatedAt || c.createdAt,
    }))
    .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt));

  res.json(logs);
});

// Admin get single conversation
app.get("/api/admin/conversations/:id", (req, res) => {
  const db = readDB();

  const conversation = db.conversations.find((c) => c.id === req.params.id);

  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  res.json({
    ...conversation,
    sentiment: conversation.sentiment || "neutral",
    status: conversation.status || "open",
    messageCount: conversation.messages ? conversation.messages.length : 0,
    updatedAt: conversation.updatedAt || conversation.createdAt,
  });
});

// Admin delete conversation
app.delete("/api/admin/conversations/:id", (req, res) => {
  const db = readDB();

  db.conversations = db.conversations.filter((c) => c.id !== req.params.id);

  writeDB(db);

  res.json({ ok: true });
});

// Customer delete conversation
app.delete("/api/conversations/:id", (req, res) => {
  const db = readDB();

  db.conversations = db.conversations.filter((c) => c.id !== req.params.id);

  writeDB(db);

  res.json({ ok: true });
});

// Create lead from landing page / free trial / contact form
app.post("/api/leads", (req, res) => {
  const db = readDB();

  const lead = {
    id: Date.now().toString(),
    email: req.body.email || "",
    source: req.body.source || "landing",
    name: req.body.name || "",
    subject: req.body.subject || "",
    message: req.body.message || "",
    createdAt: new Date().toISOString(),
  };

  if (!lead.email) {
    return res.status(400).json({ message: "Email is required" });
  }

  db.leads.push(lead);
  writeDB(db);

  res.status(201).json({
    ok: true,
    message: "Lead saved successfully",
    lead,
  });
});

// Admin users
app.get("/api/admin/users", (req, res) => {
  const db = readDB();

  const users = db.users.map((u) => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role,
    emailVerified: u.emailVerified || false,
    createdAt: u.createdAt,
  }));

  res.json(users);
});

// Admin leads
app.get("/api/admin/leads", (req, res) => {
  const db = readDB();

  const leads = db.leads.sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  res.json(leads);
});
app.post("/api/orders", (req, res) => {
  const db = readDB();

  const order = {
    id: "DEMO-" + Date.now(),
    customer: req.body.customer || {},
    items: req.body.items || [],
    subtotal: req.body.subtotal || 0,
    delivery: req.body.delivery || 0,
    total: req.body.total || 0,
    paymentStatus: "Paid (Demo)",
    orderStatus: "Received",
    createdAt: new Date().toISOString(),
  };

  db.orders.push(order);
  writeDB(db);

  res.status(201).json({
    ok: true,
    order,
  });
});

app.get("/api/admin/orders", (req, res) => {
  const db = readDB();

  const orders = (db.orders || []).sort(
    (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
  );

  res.json(orders);
});

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`ClariBot API running on http://localhost:${PORT}`);
});