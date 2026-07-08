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

// ClariMart shopping assistant chatbot reply logic
function getBotReply(userText) {
  const msg = String(userText || "").toLowerCase();

  const products = [
    {
      name: "Premium Pure Tahini 750g",
      category: "Pantry",
      price: 10.5,
      oldPrice: "$12.50",
      displayPrice: "$10.50",
      stock: 25,
      description:
        "Smooth sesame tahini, perfect for hummus, dips, sauces, salad dressing and healthy breakfast bowls.",
      speciality:
        "This is one of our best Mediterranean pantry products because it is healthy, creamy and useful in many dishes.",
      offer: "Special offer: reduced from $12.50 to $10.50.",
      keywords: ["tahini", "sesame", "premium pure tahini", "dip", "sauce", "hummus"],
    },
    {
      name: "Flower Honey 1kg",
      category: "Breakfast",
      price: 10.0,
      oldPrice: "",
      displayPrice: "$10.00",
      stock: 18,
      description: "Natural flower honey for tea, toast, desserts and breakfast.",
      speciality:
        "A family-size 1kg honey jar, good for breakfast, drinks and desserts.",
      offer: "Popular breakfast product with great value for a 1kg pack.",
      keywords: ["honey", "flower honey", "breakfast", "tea", "toast"],
    },
    {
      name: "Rose Turkish Delight 250g",
      category: "Sweets",
      price: 5.0,
      oldPrice: "",
      displayPrice: "$5.00",
      stock: 40,
      description:
        "Soft rose-flavoured Turkish delight, good for dessert or gifting.",
      speciality:
        "A traditional Mediterranean sweet with soft texture and rose flavour.",
      offer: "Budget-friendly sweet item at only $5.00.",
      keywords: ["turkish delight", "rose", "sweet", "sweets", "dessert"],
    },
    {
      name: "Turkish Style Yogurt 2kg",
      category: "Dairy",
      price: 7.0,
      oldPrice: "",
      displayPrice: "$7.00",
      stock: 12,
      description:
        "Thick Turkish-style yogurt for breakfast, cooking, dips and sauces.",
      speciality:
        "A large 2kg family pack, useful for breakfast and Mediterranean cooking.",
      offer: "Family-size 2kg pack for only $7.00.",
      keywords: ["yogurt", "yoghurt", "turkish yogurt", "dairy", "breakfast"],
    },
    {
      name: "Halal Beef Sucuk 500g",
      category: "Halal Meat",
      price: 13.6,
      oldPrice: "",
      displayPrice: "$13.60",
      stock: 9,
      description:
        "Spiced halal beef sucuk sausage, good for breakfast, sandwiches and cooking.",
      speciality:
        "One of our speciality halal meat products, suitable for customers looking for halal grocery options.",
      offer: "Speciality halal product available in limited stock.",
      keywords: ["sucuk", "beef", "halal", "meat", "sausage"],
    },
    {
      name: "Dubai Chocolate",
      category: "Sweets",
      price: 10.0,
      oldPrice: "",
      displayPrice: "$10.00",
      stock: 15,
      description: "Premium chocolate dessert with rich creamy flavour.",
      speciality:
        "A premium sweet item for customers who want a modern dessert product.",
      offer: "New sweet item, perfect for dessert lovers.",
      keywords: ["dubai chocolate", "chocolate", "sweet", "dessert"],
    },
  ];

  function productLine(p) {
    return `${p.name} — ${p.displayPrice} | Stock: ${p.stock} | ${p.category}`;
  }

  function productList(items = products) {
    return items.map((p, i) => `${i + 1}. ${productLine(p)}`).join("\n");
  }

  function priceList() {
    return products.map((p) => `• ${p.name}: ${p.displayPrice}`).join("\n");
  }

  function stockList() {
    return products.map((p) => `• ${p.name}: ${p.stock} available`).join("\n");
  }

  const matchedProduct = products.find((product) =>
    product.keywords.some((keyword) => msg.includes(keyword))
  );

  if (msg.includes("hello") || msg.includes("hi") || msg.includes("hey")) {
    return "Hi! 👋 I’m ClariBot, your ClariMart shopping assistant. I can help you find products, check prices, explain offers, suggest items, check stock, and guide you with delivery, cart, checkout and refunds.";
  }

  if (
    msg.includes("offer") ||
    msg.includes("offers") ||
    msg.includes("discount") ||
    msg.includes("sale") ||
    msg.includes("special deal") ||
    msg.includes("promotion")
  ) {
    return `Current ClariMart offers:\n\n• Free delivery on orders over $50\n• Premium Pure Tahini 750g is on sale from $12.50 to $10.50\n• Rose Turkish Delight 250g is only $5.00, a budget-friendly sweet option\n• Turkish Style Yogurt 2kg is a family-size dairy item for only $7.00\n• Halal Beef Sucuk 500g is one of our speciality halal products\n\nYou can ask me about any product, and I can explain its price, speciality, best use and stock.`;
  }

  if (
    msg.includes("speciality") ||
    msg.includes("specialty") ||
    msg.includes("special about") ||
    msg.includes("why special") ||
    msg.includes("what is special")
  ) {
    if (matchedProduct) {
      return `${matchedProduct.name} is special because ${matchedProduct.speciality}\n\nPrice: ${matchedProduct.displayPrice}\nStock: ${matchedProduct.stock}\nOffer: ${matchedProduct.offer}`;
    }

    return "ClariMart specialises in Mediterranean grocery products such as tahini, honey, Turkish delight, Turkish yogurt, halal sucuk and Dubai chocolate. Our speciality is helping customers find breakfast items, halal meat, sweets, pantry products and family grocery options.";
  }

  if (matchedProduct) {
    return `Yes, we have ${matchedProduct.name}.\n\nCategory: ${matchedProduct.category}\nPrice: ${matchedProduct.displayPrice}\nStock available: ${matchedProduct.stock}\n\nSpeciality: ${matchedProduct.speciality}\n\nOffer: ${matchedProduct.offer}\n\n${matchedProduct.description}\n\nYou can click Add to Cart on the product card to buy it.`;
  }

  if (
    msg.includes("product") ||
    msg.includes("products") ||
    msg.includes("items") ||
    msg.includes("what do you sell") ||
    msg.includes("what do you have") ||
    msg.includes("available")
  ) {
    return `Here are our available ClariMart products:\n\n${productList()}\n\nToday’s highlight: Tahini is on sale from $12.50 to $10.50, and delivery is free for orders over $50.`;
  }

  if (
    msg.includes("price") ||
    msg.includes("cost") ||
    msg.includes("how much") ||
    msg.includes("rate")
  ) {
    return `Here is the current product price list:\n\n${priceList()}\n\nBest value today: Premium Pure Tahini 750g is on sale for $10.50.`;
  }

  if (
    msg.includes("stock") ||
    msg.includes("quantity") ||
    msg.includes("in stock") ||
    msg.includes("available stock")
  ) {
    return `Here is the current stock information:\n\n${stockList()}`;
  }

  if (
    msg.includes("cheap") ||
    msg.includes("cheapest") ||
    msg.includes("lowest price") ||
    msg.includes("budget")
  ) {
    const cheapest = [...products].sort((a, b) => a.price - b.price)[0];

    return `The cheapest product is ${cheapest.name} at ${cheapest.displayPrice}.\n\nIt is a ${cheapest.category} item, and we currently have ${cheapest.stock} in stock. It is a good budget-friendly option.`;
  }

  if (
    msg.includes("expensive") ||
    msg.includes("highest price") ||
    msg.includes("premium")
  ) {
    const highest = [...products].sort((a, b) => b.price - a.price)[0];

    return `The highest priced product is ${highest.name} at ${highest.displayPrice}.\n\nIt is a ${highest.category} item, and we currently have ${highest.stock} in stock.`;
  }

  if (msg.includes("halal")) {
    const halalItems = products.filter(
      (p) =>
        p.category.toLowerCase().includes("halal") ||
        p.keywords.includes("halal")
    );

    return `Yes, we have halal products:\n\n${productList(halalItems)}\n\nOur speciality halal item is Halal Beef Sucuk 500g.`;
  }

  if (
    msg.includes("dairy") ||
    msg.includes("milk") ||
    msg.includes("yogurt") ||
    msg.includes("yoghurt")
  ) {
    const dairyItems = products.filter((p) => p.category === "Dairy");

    return `Here are our dairy products:\n\n${productList(dairyItems)}\n\nTurkish Style Yogurt 2kg is good for breakfast, cooking, dips and sauces.`;
  }

  if (
    msg.includes("sweet") ||
    msg.includes("sweets") ||
    msg.includes("dessert") ||
    msg.includes("chocolate")
  ) {
    const sweetItems = products.filter(
      (p) => p.category === "Sweets" || p.keywords.includes("dessert")
    );

    return `Here are our sweets and dessert products:\n\n${productList(sweetItems)}\n\nRose Turkish Delight is a budget-friendly sweet, while Dubai Chocolate is a premium dessert option.`;
  }

  if (msg.includes("breakfast")) {
    return `For breakfast, I recommend:\n\n1. Flower Honey 1kg — $10.00\nGood for tea, toast and breakfast.\n\n2. Turkish Style Yogurt 2kg — $7.00\nGood for breakfast bowls and cooking.\n\n3. Premium Pure Tahini 750g — $10.50\nGood for healthy Mediterranean-style breakfast, dips and sauces.`;
  }

  if (
    msg.includes("recommend") ||
    msg.includes("suggest") ||
    msg.includes("best")
  ) {
    return `My recommendations:\n\n• For breakfast: Flower Honey 1kg and Turkish Style Yogurt 2kg\n• For cooking: Premium Pure Tahini and Halal Beef Sucuk\n• For dessert: Rose Turkish Delight or Dubai Chocolate\n• For best value: Premium Pure Tahini is currently on sale\n• For halal option: Halal Beef Sucuk 500g\n\nTell me your category, and I can suggest better.`;
  }

  if (
    msg.includes("delivery") ||
    msg.includes("shipping") ||
    msg.includes("deliver")
  ) {
    return "ClariMart offers delivery for grocery orders. Delivery is free for orders over $50. Otherwise, delivery is $8.99. Delivery time may depend on the customer location and order size.";
  }

  if (
    msg.includes("cart") ||
    msg.includes("add to cart") ||
    msg.includes("checkout") ||
    msg.includes("order")
  ) {
    return "To order, choose a product and click Add to Cart. Then open the Cart page, review your items, and continue to demo checkout. No real payment is deducted in this demo website.";
  }

  if (
    msg.includes("refund") ||
    msg.includes("return") ||
    msg.includes("cancel")
  ) {
    return "Refund and return requests are reviewed by the store team. Customers should provide the order number, product name, purchase date and reason for return. Opened or perishable food items may only be refunded if there is a quality issue.";
  }

  if (
    msg.includes("opening") ||
    msg.includes("hours") ||
    msg.includes("open") ||
    msg.includes("close")
  ) {
    return "ClariMart is open Monday to Saturday, 9:00 AM to 6:00 PM. Online product browsing and ClariBot support are available anytime.";
  }

  if (
    msg.includes("contact") ||
    msg.includes("support") ||
    msg.includes("phone") ||
    msg.includes("email")
  ) {
    return "You can contact ClariMart support at support@claribot.com. You can also ask me here about products, prices, stock, offers, delivery, refunds and checkout help.";
  }

  return "I’m ClariBot, your ClariMart shopping assistant. I can help with product details, prices, offers, stock, halal items, dairy, sweets, breakfast recommendations, delivery, cart, checkout, refunds and opening hours.";
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
        text: "Hi! 👋 I’m ClariBot, your ClariMart shopping assistant. Ask me about products, prices, offers, special items, delivery, checkout, refunds or opening hours.",
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

// Create demo order
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

// Admin orders
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