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

/* =========================================================
   DATABASE HELPERS
========================================================= */

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

/* =========================================================
   AUTHENTICATION HELPERS
========================================================= */

function createToken(user) {
  return jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET || "claribot_secret_key",
    {
      expiresIn: "1d",
    }
  );
}

function normalizeEmail(email) {
  return String(email || "").toLowerCase().trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/* =========================================================
   EMAIL OTP
========================================================= */

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
      <div style="font-family:Arial,sans-serif;background:#f7f2ff;padding:24px;">
        <div style="max-width:520px;margin:auto;background:white;border-radius:16px;padding:28px;">
          <h2 style="color:#7c3aed;">ClariBot Email Verification</h2>

          <p>
            Use this verification code to complete your account registration:
          </p>

          <div
            style="
              font-size:32px;
              font-weight:bold;
              letter-spacing:8px;
              color:#7c3aed;
              background:#f3e8ff;
              padding:16px;
              border-radius:12px;
              text-align:center;
            "
          >
            ${otp}
          </div>

          <p>This OTP is valid for 10 minutes.</p>

          <p>
            If you did not request this code, please ignore this email.
          </p>

          <p>
            Regards,<br />
            ClariBot Support Team
          </p>
        </div>
      </div>
    `,
  });
}

/* =========================================================
   CLARIMART PRODUCT DATA
========================================================= */

const CLARIMART_PRODUCTS = [
  {
    id: "1",
    name: "Premium Pure Tahini 750g",
    category: "Pantry",
    price: 10.5,
    oldPrice: 12.5,
    displayPrice: "$10.50",
    stock: 25,
    image: "/products/tahini.png",
    badge: "Best Value",
    rating: 4.9,
    description:
      "Smooth sesame tahini for hummus, dips, sauces, salad dressing and breakfast bowls.",
    reason:
      "One of our best-value Mediterranean pantry products and currently on sale.",
    speciality:
      "Healthy, creamy and useful in many Mediterranean meals.",
    offer: "Reduced from $12.50 to $10.50.",
    keywords: [
      "tahini",
      "sesame",
      "hummus",
      "dip",
      "sauce",
      "healthy",
      "breakfast",
      "cooking",
    ],
  },
  {
    id: "2",
    name: "Flower Honey 1kg",
    category: "Pantry",
    price: 10,
    oldPrice: null,
    displayPrice: "$10.00",
    stock: 18,
    image: "/products/honey.png",
    badge: "Popular",
    rating: 4.8,
    description:
      "Natural flower honey for tea, toast, desserts and breakfast.",
    reason:
      "A popular family-size breakfast product with excellent value.",
    speciality:
      "A natural sweetener suitable for breakfast, tea and desserts.",
    offer: "Popular breakfast product with great value for a 1kg pack.",
    keywords: [
      "honey",
      "flower honey",
      "tea",
      "toast",
      "breakfast",
      "natural",
      "sweetener",
    ],
  },
  {
    id: "3",
    name: "Rose Turkish Delight 250g",
    category: "Sweets",
    price: 5,
    oldPrice: null,
    displayPrice: "$5.00",
    stock: 40,
    image: "/products/turkish-delight.png",
    badge: "Budget Pick",
    rating: 4.7,
    description:
      "Traditional soft rose-flavoured Turkish delight for dessert or gifting.",
    reason:
      "Our most affordable traditional sweet and a great gifting option.",
    speciality:
      "A traditional Mediterranean sweet with soft texture and rose flavour.",
    offer: "Budget-friendly sweet item at only $5.00.",
    keywords: [
      "turkish delight",
      "rose",
      "sweet",
      "sweets",
      "dessert",
      "gift",
      "cheap",
      "budget",
    ],
  },
  {
    id: "4",
    name: "Turkish Style Yogurt 2kg",
    category: "Dairy",
    price: 7,
    oldPrice: null,
    displayPrice: "$7.00",
    stock: 12,
    image: "/products/yogurt.png",
    badge: "Family Choice",
    rating: 4.8,
    description:
      "Thick Turkish-style yogurt for breakfast, cooking, dips and sauces.",
    reason:
      "A large family-size pack suitable for breakfast and Mediterranean cooking.",
    speciality:
      "A large 2kg family pack useful for breakfast and cooking.",
    offer: "Family-size 2kg pack for only $7.00.",
    keywords: [
      "yogurt",
      "yoghurt",
      "turkish yogurt",
      "dairy",
      "breakfast",
      "family",
      "healthy",
    ],
  },
  {
    id: "5",
    name: "Halal Beef Sucuk 500g",
    category: "Halal Meat",
    price: 13.6,
    oldPrice: null,
    displayPrice: "$13.60",
    stock: 9,
    image: "/products/sucuk.png",
    badge: "Halal Choice",
    rating: 4.9,
    description:
      "Spiced halal beef sucuk for breakfast, sandwiches and cooking.",
    reason:
      "A speciality halal meat product with rich Mediterranean flavour.",
    speciality:
      "One of our speciality halal products for breakfast and cooking.",
    offer: "Speciality halal product available in limited stock.",
    keywords: [
      "sucuk",
      "beef",
      "halal",
      "meat",
      "sausage",
      "sandwich",
      "cooking",
    ],
  },
  {
    id: "6",
    name: "Dubai Chocolate",
    category: "Sweets",
    price: 10,
    oldPrice: null,
    displayPrice: "$10.00",
    stock: 15,
    image: "/products/dubai-chocolate.png",
    badge: "Premium Pick",
    rating: 4.9,
    description:
      "Premium chocolate dessert with a rich and creamy flavour.",
    reason:
      "A premium modern dessert option for chocolate lovers.",
    speciality:
      "A premium sweet item for customers who want a modern dessert.",
    offer: "New sweet item, perfect for dessert lovers.",
    keywords: [
      "dubai chocolate",
      "chocolate",
      "dessert",
      "sweet",
      "premium",
    ],
  },
];

/* =========================================================
   CHATBOT HELPERS
========================================================= */

function createBotResponse(text, recommendedProducts = []) {
  return {
    text,
    recommendedProducts,
  };
}

function getProductsByIds(ids) {
  return CLARIMART_PRODUCTS.filter((product) =>
    ids.includes(product.id)
  );
}

function getBotReply(userText) {
  const msg = String(userText || "").toLowerCase().trim();
  const products = CLARIMART_PRODUCTS;

  const matchedProduct = products.find((product) =>
    product.keywords.some((keyword) => msg.includes(keyword))
  );

  if (
    msg === "hi" ||
    msg === "hello" ||
    msg === "hey" ||
    msg.includes("hello ") ||
    msg.includes("hi ") ||
    msg.includes("hey ")
  ) {
    return createBotResponse(
      "Hi! 👋 I’m ClariBot, your ClariMart shopping assistant. Tell me what you are shopping for and I’ll recommend the best matching products."
    );
  }

  if (
    msg.includes("breakfast") ||
    msg.includes("morning")
  ) {
    return createBotResponse(
      "For a balanced Mediterranean-style breakfast, I recommend honey, yogurt and tahini. These products work well for toast, breakfast bowls, dips and healthy meals.",
      getProductsByIds(["2", "4", "1"])
    );
  }

  if (
    msg.includes("sweet") ||
    msg.includes("sweets") ||
    msg.includes("dessert") ||
    msg.includes("chocolate")
  ) {
    return createBotResponse(
      "Here are my best sweet recommendations. Turkish Delight is the budget choice, Dubai Chocolate is the premium choice, and Flower Honey is a natural sweet option.",
      getProductsByIds(["3", "6", "2"])
    );
  }

  if (
    msg.includes("halal") ||
    msg.includes("meat") ||
    msg.includes("sausage") ||
    msg.includes("sucuk")
  ) {
    return createBotResponse(
      "My recommended halal product is Halal Beef Sucuk. It is suitable for breakfast, sandwiches and Mediterranean cooking.",
      getProductsByIds(["5"])
    );
  }

  if (
    msg.includes("cheap") ||
    msg.includes("cheapest") ||
    msg.includes("budget") ||
    msg.includes("lowest price") ||
    msg.includes("low price")
  ) {
    const recommendations = [...products]
      .sort((a, b) => a.price - b.price)
      .slice(0, 3);

    return createBotResponse(
      "These are the best budget-friendly choices, arranged from the lowest price.",
      recommendations
    );
  }

  if (
    msg.includes("sale") ||
    msg.includes("offer") ||
    msg.includes("offers") ||
    msg.includes("discount") ||
    msg.includes("special") ||
    msg.includes("promotion")
  ) {
    return createBotResponse(
      "Here are today’s best-value products. Tahini has a reduced price, Turkish Delight is only $5, and the 2kg yogurt is excellent family value. Delivery is free for orders over $50.",
      getProductsByIds(["1", "3", "4"])
    );
  }

  if (
    msg.includes("healthy") ||
    msg.includes("health")
  ) {
    return createBotResponse(
      "For healthier choices, I recommend tahini, natural flower honey and Turkish-style yogurt. They are versatile options for breakfast and home cooking.",
      getProductsByIds(["1", "2", "4"])
    );
  }

  if (
    msg.includes("hummus") ||
    msg.includes("make hummus")
  ) {
    return createBotResponse(
      "Tahini is the main ClariMart product I recommend for hummus. You may also need chickpeas, lemon juice, garlic and olive oil.",
      getProductsByIds(["1"])
    );
  }

  if (
    msg.includes("cooking") ||
    msg.includes("cook") ||
    msg.includes("meal")
  ) {
    return createBotResponse(
      "For cooking, my top recommendations are tahini for sauces and dressings, yogurt for dips and marinades, and halal beef sucuk for savoury meals.",
      getProductsByIds(["1", "4", "5"])
    );
  }

  if (
    msg.includes("recommend") ||
    msg.includes("suggest") ||
    msg.includes("best") ||
    msg.includes("items") ||
    msg.includes("products") ||
    msg.includes("available")
  ) {
    return createBotResponse(
      "Here are my top ClariMart recommendations based on value, popularity and variety. Tell me whether you prefer breakfast, sweets, halal food, cooking products or budget items for a more personalised suggestion.",
      getProductsByIds(["1", "2", "4", "6"])
    );
  }

  if (
    msg.includes("price") ||
    msg.includes("cost") ||
    msg.includes("how much")
  ) {
    const priceList = products
      .map(
        (product) =>
          `• ${product.name}: ${product.displayPrice}`
      )
      .join("\n");

    return createBotResponse(
      `Here is the current product price list:\n\n${priceList}`
    );
  }

  if (
    msg.includes("stock") ||
    msg.includes("quantity") ||
    msg.includes("in stock")
  ) {
    const stockList = products
      .map(
        (product) =>
          `• ${product.name}: ${product.stock} available`
      )
      .join("\n");

    return createBotResponse(
      `Here is the current stock information:\n\n${stockList}`
    );
  }

  if (
    msg.includes("premium") ||
    msg.includes("expensive") ||
    msg.includes("highest price")
  ) {
    const highest = [...products].sort(
      (a, b) => b.price - a.price
    )[0];

    return createBotResponse(
      `${highest.name} is our highest-priced speciality product at ${highest.displayPrice}.`,
      [highest]
    );
  }

  if (matchedProduct) {
    return createBotResponse(
      `${matchedProduct.name} is available for ${matchedProduct.displayPrice}. ${matchedProduct.reason}`,
      [matchedProduct]
    );
  }

  if (
    msg.includes("delivery") ||
    msg.includes("shipping") ||
    msg.includes("deliver")
  ) {
    return createBotResponse(
      "Delivery is free for orders over $50. For orders below $50, the delivery fee is $8.99."
    );
  }

  if (
    msg.includes("cart") ||
    msg.includes("checkout") ||
    msg.includes("payment") ||
    msg.includes("card") ||
    msg.includes("order")
  ) {
    return createBotResponse(
      "Choose a product and click Add to Cart. Then open the Cart page, review your items and continue to demo checkout. No real money is deducted."
    );
  }

  if (
    msg.includes("refund") ||
    msg.includes("return") ||
    msg.includes("cancel")
  ) {
    return createBotResponse(
      "Refund requests should include the order number, product name and reason. Opened or perishable items may only be refunded where there is a quality issue."
    );
  }

  if (
    msg.includes("opening") ||
    msg.includes("hours") ||
    msg.includes("open") ||
    msg.includes("close")
  ) {
    return createBotResponse(
      "ClariMart is open Monday to Saturday from 9:00 AM to 6:00 PM. Online shopping and ClariBot support are available anytime."
    );
  }

  if (
    msg.includes("contact") ||
    msg.includes("support") ||
    msg.includes("phone") ||
    msg.includes("email")
  ) {
    return createBotResponse(
      "You can contact ClariMart support at support@claribot.com. You can also ask me about products, prices, stock, offers, delivery and checkout."
    );
  }

  return createBotResponse(
    "I can recommend products by category, price, meal type or preference. Try asking: “best breakfast products”, “cheap sweets”, “halal products”, “healthy items” or “what is on sale?”"
  );
}

/* =========================================================
   BASIC TEST ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.send("ClariBot backend is running");
});

/* =========================================================
   ADMIN LOGIN
========================================================= */

app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body;

  if (
    email !== "admin@claribot.com" ||
    password !== "admin123"
  ) {
    return res.status(401).json({
      message: "Invalid admin credentials",
    });
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

/* =========================================================
   REQUEST CUSTOMER OTP
========================================================= */

app.post("/api/auth/request-otp", async (req, res) => {
  try {
    const db = readDB();
    const email = normalizeEmail(req.body.email);

    if (!email) {
      return res.status(400).json({
        message: "Email is required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    const existingUser = db.users.find(
      (user) =>
        normalizeEmail(user.email) === email &&
        user.role === "customer"
    );

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists with this email",
      });
    }

    const otp = Math.floor(
      100000 + Math.random() * 900000
    ).toString();

    db.otps = db.otps.filter(
      (item) => item.email !== email
    );

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
      message:
        "Failed to send OTP email. Please check email configuration.",
      error: error.message,
    });
  }
});

/* =========================================================
   CUSTOMER SIGNUP
========================================================= */

app.post("/api/auth/signup", async (req, res) => {
  try {
    const db = readDB();

    const name = String(req.body.name || "").trim();
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");
    const otp = String(req.body.otp || "").trim();

    if (!name || !email || !password || !otp) {
      return res.status(400).json({
        message:
          "Full name, email, password and OTP are required",
      });
    }

    if (!isValidEmail(email)) {
      return res.status(400).json({
        message: "Please enter a valid email address",
      });
    }

    if (password.length < 6) {
      return res.status(400).json({
        message: "Password must be at least 6 characters",
      });
    }

    const existingUser = db.users.find(
      (user) =>
        normalizeEmail(user.email) === email &&
        user.role === "customer"
    );

    if (existingUser) {
      return res.status(409).json({
        message: "User already exists",
      });
    }

    const otpRecord = db.otps.find(
      (item) =>
        item.email === email &&
        item.otp === otp
    );

    if (!otpRecord) {
      return res.status(400).json({
        message: "Invalid OTP",
      });
    }

    if (Date.now() > otpRecord.expiresAt) {
      db.otps = db.otps.filter(
        (item) => item.email !== email
      );

      writeDB(db);

      return res.status(400).json({
        message:
          "OTP has expired. Please request a new OTP.",
      });
    }

    const hashedPassword = await bcrypt.hash(
      password,
      10
    );

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

    db.otps = db.otps.filter(
      (item) => item.email !== email
    );

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

/* =========================================================
   CUSTOMER LOGIN
========================================================= */

app.post("/api/auth/login", async (req, res) => {
  try {
    const email = normalizeEmail(req.body.email);
    const password = String(req.body.password || "");

    const db = readDB();

    const user = db.users.find(
      (item) =>
        normalizeEmail(item.email) === email &&
        item.role === "customer"
    );

    if (!user) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
    }

    const passwordMatch = await bcrypt.compare(
      password,
      user.password
    );

    if (!passwordMatch) {
      return res.status(401).json({
        message: "Invalid email or password",
      });
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
  } catch (error) {
    console.error("Login error:", error);

    res.status(500).json({
      message: "Login failed",
    });
  }
});

/* =========================================================
   ADMIN SUMMARY
========================================================= */

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

/* =========================================================
   ADMIN SETTINGS
========================================================= */

app.get("/api/admin/settings", (req, res) => {
  res.json({
    botName: "ClariBot",
    supportEmail: "support@claribot.com",
    status: "active",
  });
});

/* =========================================================
   CUSTOMER CONVERSATIONS
========================================================= */

app.get("/api/conversations", (req, res) => {
  const db = readDB();

  const conversations = db.conversations
    .map((conversation) => ({
      ...conversation,
      updatedAt:
        conversation.updatedAt ||
        conversation.createdAt,
    }))
    .sort(
      (a, b) =>
        new Date(b.updatedAt) -
        new Date(a.updatedAt)
    );

  res.json(conversations);
});

app.post("/api/conversations", (req, res) => {
  const db = readDB();
  const nowTime = new Date().toISOString();

  const conversation = {
    id: Date.now().toString(),
    userId: req.body.userId || "guest",
    title:
      req.body.title ||
      "New conversation",
    status: "open",
    sentiment: "neutral",
    messages: [
      {
        id: Date.now().toString(),
        role: "bot",
        text:
          "Hi! 👋 I’m ClariBot, your ClariMart shopping assistant. Ask me about products, prices, recommendations, delivery, checkout or refunds.",
        recommendedProducts: [],
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

/* =========================================================
   SEND CHAT MESSAGE
========================================================= */

app.post(
  "/api/conversations/:id/messages",
  (req, res) => {
    const db = readDB();

    const conversation = db.conversations.find(
      (item) => item.id === req.params.id
    );

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    const text = String(req.body.text || "");
    const nowTime = new Date().toISOString();

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      text,
      createdAt: nowTime,
    };

    // IMPORTANT:
    // getBotReply returns an object containing:
    // {
    //   text: string,
    //   recommendedProducts: array
    // }

    const botReply = getBotReply(text);

    const botMessage = {
      id: (Date.now() + 1).toString(),
      role: "bot",

      // React must receive a normal string here
      text: botReply.text,

      // Product cards are stored separately
      recommendedProducts:
        botReply.recommendedProducts || [],

      createdAt: new Date().toISOString(),
    };

    conversation.messages.push(
      userMessage,
      botMessage
    );

    conversation.updatedAt =
      new Date().toISOString();

    if (
      conversation.title === "New conversation" &&
      text.trim()
    ) {
      conversation.title =
        text.length > 28
          ? `${text.slice(0, 28)}...`
          : text;
    }

    writeDB(db);

    res.json({
      userMessage,
      botMessage,
      reply: botMessage,
      conversation,
    });
  }
);

/* =========================================================
   ADMIN CONVERSATIONS
========================================================= */

app.get(
  "/api/admin/conversations",
  (req, res) => {
    const db = readDB();

    const conversations = db.conversations
      .map((conversation) => ({
        ...conversation,
        sentiment:
          conversation.sentiment || "neutral",
        status:
          conversation.status || "open",
        messageCount:
          conversation.messages?.length || 0,
        updatedAt:
          conversation.updatedAt ||
          conversation.createdAt,
      }))
      .sort(
        (a, b) =>
          new Date(b.updatedAt) -
          new Date(a.updatedAt)
      );

    res.json(conversations);
  }
);

app.get(
  "/api/admin/chat-logs",
  (req, res) => {
    const db = readDB();

    const logs = db.conversations
      .map((conversation) => ({
        ...conversation,
        sentiment:
          conversation.sentiment || "neutral",
        status:
          conversation.status || "open",
        messageCount:
          conversation.messages?.length || 0,
        updatedAt:
          conversation.updatedAt ||
          conversation.createdAt,
      }))
      .sort(
        (a, b) =>
          new Date(b.updatedAt) -
          new Date(a.updatedAt)
      );

    res.json(logs);
  }
);

app.get(
  "/api/admin/conversations/:id",
  (req, res) => {
    const db = readDB();

    const conversation = db.conversations.find(
      (item) => item.id === req.params.id
    );

    if (!conversation) {
      return res.status(404).json({
        message: "Conversation not found",
      });
    }

    res.json({
      ...conversation,
      sentiment:
        conversation.sentiment || "neutral",
      status:
        conversation.status || "open",
      messageCount:
        conversation.messages?.length || 0,
      updatedAt:
        conversation.updatedAt ||
        conversation.createdAt,
    });
  }
);

app.delete(
  "/api/admin/conversations/:id",
  (req, res) => {
    const db = readDB();

    db.conversations =
      db.conversations.filter(
        (conversation) =>
          conversation.id !== req.params.id
      );

    writeDB(db);

    res.json({
      ok: true,
    });
  }
);

app.delete(
  "/api/conversations/:id",
  (req, res) => {
    const db = readDB();

    db.conversations =
      db.conversations.filter(
        (conversation) =>
          conversation.id !== req.params.id
      );

    writeDB(db);

    res.json({
      ok: true,
    });
  }
);

/* =========================================================
   LEADS
========================================================= */

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
    return res.status(400).json({
      message: "Email is required",
    });
  }

  db.leads.push(lead);
  writeDB(db);

  res.status(201).json({
    ok: true,
    message: "Lead saved successfully",
    lead,
  });
});

/* =========================================================
   ADMIN USERS
========================================================= */

app.get("/api/admin/users", (req, res) => {
  const db = readDB();

  const users = db.users.map((user) => ({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    emailVerified:
      user.emailVerified || false,
    createdAt: user.createdAt,
  }));

  res.json(users);
});

/* =========================================================
   ADMIN LEADS
========================================================= */

app.get("/api/admin/leads", (req, res) => {
  const db = readDB();

  const leads = [...db.leads].sort(
    (a, b) =>
      new Date(b.createdAt) -
      new Date(a.createdAt)
  );

  res.json(leads);
});

/* =========================================================
   ORDERS
========================================================= */

app.get("/api/orders/:id", (req, res) => {
  const db = readDB();

  const order = (db.orders || []).find(
    (item) =>
      String(item.id).toLowerCase() ===
      String(req.params.id).toLowerCase()
  );

  if (!order) {
    return res.status(404).json({
      ok: false,
      message: "Order not found",
    });
  }

  res.json({
    ok: true,
    order,
  });
});

app.get("/api/admin/orders", (req, res) => {
  const db = readDB();

  const orders = [...(db.orders || [])].sort(
    (a, b) =>
      new Date(b.createdAt) -
      new Date(a.createdAt)
  );

  res.json(orders);
});

/* =========================================================
   START SERVER
========================================================= */

const PORT = process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(
    `ClariBot API running on http://localhost:${PORT}`
  );
});