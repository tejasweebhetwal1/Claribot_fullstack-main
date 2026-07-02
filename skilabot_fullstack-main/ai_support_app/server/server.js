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
  return JSON.parse(fs.readFileSync(DB_PATH, "utf-8"));
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

// simple chatbot reply logic
function getBotReply(userText) {
  const msg = (userText || "").toLowerCase();

  if (
    msg.includes("opening") ||
    msg.includes("opening time") ||
    msg.includes("opening hours") ||
    msg.includes("business hours") ||
    msg.includes("open time") ||
    msg.includes("what time do you open") ||
    msg.includes("what time")
  ) {
    return "Our opening hours are Monday to Friday, 9:00 AM to 5:00 PM. We are closed on weekends and public holidays.";
  }

  if (
    msg.includes("contact") ||
    msg.includes("phone") ||
    msg.includes("call") ||
    msg.includes("email")
  ) {
    return "You can contact our support team by email at support@claribot.com or call us during business hours.";
  }

  if (
    msg.includes("price") ||
    msg.includes("cost") ||
    msg.includes("pricing") ||
    msg.includes("fee")
  ) {
    return "Our pricing depends on your business needs. Please contact our support team and we will help you choose the best plan.";
  }

  if (
    msg.includes("refund") ||
    msg.includes("return") ||
    msg.includes("money back")
  ) {
    return "Refund requests are reviewed by our support team. Please provide your order details so we can assist you further.";
  }

  if (
    msg.includes("export") ||
    msg.includes("chat history") ||
    msg.includes("download chat")
  ) {
    return "Yes! You can export your full chat history as CSV or JSON from Settings → Data → Export Conversations.";
  }

  if (
    msg.includes("hello") ||
    msg.includes("hi") ||
    msg.includes("hey")
  ) {
    return "Hello! 👋 I’m ClariBot, your AI support assistant. How can I help you today?";
  }

  if (
    msg.includes("thank") ||
    msg.includes("thanks")
  ) {
    return "You’re welcome! I’m happy to help.";
  }

  return "Thanks for reaching out! I'd be happy to help. Could you share a bit more detail so I can give you the most accurate answer?";
}

app.get("/", (req, res) => {
  res.send("ClariBot backend is running");
});

// admin login
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

// customer signup
app.post("/api/auth/signup", async (req, res) => {
  const { name, email, password } = req.body;

  if (!email || !password) {
    return res.status(400).json({ message: "Email and password required" });
  }

  const db = readDB();

  const existingUser = db.users.find((u) => u.email === email);

  if (existingUser) {
    return res.status(409).json({ message: "User already exists" });
  }

  const hashedPassword = await bcrypt.hash(password, 10);

  const user = {
    id: Date.now().toString(),
    name: name || "Customer",
    email,
    password: hashedPassword,
    role: "customer",
    createdAt: new Date().toISOString(),
  };

  db.users.push(user);
  writeDB(db);

  res.status(201).json({
    message: "Signup successful",
    token: createToken(user),
    user: {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
    },
  });
});

// customer login
app.post("/api/auth/login", async (req, res) => {
  const { email, password } = req.body;

  const db = readDB();

  const user = db.users.find(
    (u) => u.email === email && u.role === "customer"
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
    },
  });
});

// admin summary
app.get("/api/admin/summary", (req, res) => {
  const db = readDB();

  res.json({
    totalUsers: db.users.length,
    totalConversations: db.conversations.length,
    resolutionRate: 0,
    escalated: 0,
    leadsCaptured: 0,
    avgResponse: "< 1s",
  });
});

// admin settings
app.get("/api/admin/settings", (req, res) => {
  res.json({
    botName: "ClariBot",
    supportEmail: "support@claribot.com",
    status: "active",
  });
});

// get all conversations
app.get("/api/conversations", (req, res) => {
  const db = readDB();
  res.json(db.conversations);
});

// create new conversation
app.post("/api/conversations", (req, res) => {
  const db = readDB();

  const conversation = {
    id: Date.now().toString(),
    userId: req.body.userId || "guest",
    title: req.body.title || "New conversation",
    status: "open",
    messages: [
      {
        id: Date.now().toString(),
        role: "bot",
        text: "Hello! 👋 I’m ClariBot, your AI support assistant. How can I help you today?",
        createdAt: new Date().toISOString(),
      },
    ],
    createdAt: new Date().toISOString(),
  };

  db.conversations.push(conversation);
  writeDB(db);

  res.status(201).json(conversation);
});

// send message to conversation
app.post("/api/conversations/:id/messages", (req, res) => {
  const db = readDB();

  const conversation = db.conversations.find((c) => c.id === req.params.id);

  if (!conversation) {
    return res.status(404).json({ message: "Conversation not found" });
  }

  const text = req.body.text || "";

  const userMessage = {
    id: Date.now().toString(),
    role: "user",
    text,
    createdAt: new Date().toISOString(),
  };

  const botMessage = {
    id: (Date.now() + 1).toString(),
    role: "bot",
    text: getBotReply(text),
    createdAt: new Date().toISOString(),
  };

  conversation.messages.push(userMessage, botMessage);
  writeDB(db);

  res.json({
    userMessage,
    botMessage,
    conversation,
  });
});
// admin get all conversations
app.get("/api/admin/conversations", (req, res) => {
  const db = readDB();

  const conversations = db.conversations.map((c) => ({
    ...c,
    sentiment: c.sentiment || "neutral",
    status: c.status || "open",
    messageCount: c.messages ? c.messages.length : 0,
    updatedAt: c.updatedAt || c.createdAt,
  }));

  res.json(conversations);
});

// admin chat logs
app.get("/api/admin/chat-logs", (req, res) => {
  const db = readDB();

  const logs = db.conversations.map((c) => ({
    ...c,
    sentiment: c.sentiment || "neutral",
    status: c.status || "open",
    messageCount: c.messages ? c.messages.length : 0,
    updatedAt: c.updatedAt || c.createdAt,
  }));

  res.json(logs);
});

// admin get single conversation
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

// admin delete conversation
app.delete("/api/admin/conversations/:id", (req, res) => {
  const db = readDB();

  db.conversations = db.conversations.filter((c) => c.id !== req.params.id);

  writeDB(db);

  res.json({ ok: true });
});
const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(`ClariBot API running on http://localhost:${PORT}`);
});