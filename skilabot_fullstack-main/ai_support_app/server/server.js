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

const DB_PATH = path.join(
  __dirname,
  "data",
  "db.json"
);

/* =========================================================
   DATABASE HELPERS
========================================================= */

function readDB() {
  const dataDirectory = path.dirname(DB_PATH);

  if (!fs.existsSync(dataDirectory)) {
    fs.mkdirSync(dataDirectory, {
      recursive: true,
    });
  }

  if (!fs.existsSync(DB_PATH)) {
    fs.writeFileSync(
      DB_PATH,
      JSON.stringify(
        {
          users: [],
          conversations: [],
          leads: [],
          otps: [],
          orders: [],
          returns: [],
          settings: {
            businessName: "ClariMart",
            escalationEmail:
              "admin@clarimart.com",
            botTone:
              "Friendly and concise",
            retentionDays: 90,
            confidenceThreshold: 85,
            maxTurns: 8,
            slackWebhook: "",
          },
        },
        null,
        2
      )
    );
  }

  const rawData = fs.readFileSync(
    DB_PATH,
    "utf-8"
  );

  const db = rawData.trim()
    ? JSON.parse(rawData)
    : {};

  db.users = db.users || [];
  db.conversations =
    db.conversations || [];
  db.leads = db.leads || [];
  db.otps = db.otps || [];
  db.orders = db.orders || [];
  db.returns = db.returns || [];

  db.settings = db.settings || {
    businessName: "ClariMart",
    escalationEmail:
      "admin@clarimart.com",
    botTone: "Friendly and concise",
    retentionDays: 90,
    confidenceThreshold: 85,
    maxTurns: 8,
    slackWebhook: "",
  };

  return db;
}

function writeDB(data) {
  fs.writeFileSync(
    DB_PATH,
    JSON.stringify(data, null, 2)
  );
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
    process.env.JWT_SECRET ||
      "claribot_secret_key",
    {
      expiresIn: "1d",
    }
  );
}

function normalizeEmail(email) {
  return String(email || "")
    .toLowerCase()
    .trim();
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
    email
  );
}

/* =========================================================
   EMAIL OTP
========================================================= */

async function sendOtpEmail(
  toEmail,
  otp
) {
  if (
    !process.env.EMAIL_USER ||
    !process.env.EMAIL_PASS
  ) {
    throw new Error(
      "Email sender is not configured"
    );
  }

  const transporter =
    nodemailer.createTransport({
      service: "gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS,
      },
    });

  await transporter.sendMail({
    from: `"ClariBot Support" <${process.env.EMAIL_USER}>`,
    to: toEmail,
    subject:
      "Your ClariBot Verification Code",
    text: `Your ClariBot OTP is ${otp}. This code is valid for 10 minutes.`,
    html: `
      <div style="font-family:Arial,sans-serif;background:#f0f9ff;padding:24px;">
        <div style="max-width:520px;margin:auto;background:#ffffff;border-radius:16px;padding:28px;">
          <h2 style="color:#0284c7;">
            ClariMart Email Verification
          </h2>

          <p>
            Use this verification code to complete your account registration:
          </p>

          <div
            style="
              font-size:32px;
              font-weight:bold;
              letter-spacing:8px;
              color:#0284c7;
              background:#e0f2fe;
              padding:16px;
              border-radius:12px;
              text-align:center;
            "
          >
            ${otp}
          </div>

          <p>
            This OTP is valid for 10 minutes.
          </p>
        </div>
      </div>
    `,
  });
}

/* =========================================================
   PRODUCT DATA FOR CHATBOT
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
      "Smooth sesame tahini for hummus, dips and sauces.",
    reason:
      "One of our best-value Mediterranean pantry products.",
    keywords: [
      "tahini",
      "sesame",
      "hummus",
      "dip",
      "sauce",
    ],
  },
  {
    id: "2",
    name: "Flower Honey 1kg",
    category: "Pantry",
    price: 10,
    displayPrice: "$10.00",
    stock: 18,
    image: "/products/honey.png",
    badge: "Popular",
    rating: 4.8,
    description:
      "Natural flower honey for tea, toast and breakfast.",
    reason:
      "A popular family-size breakfast product.",
    keywords: [
      "honey",
      "flower honey",
      "tea",
      "toast",
      "breakfast",
    ],
  },
  {
    id: "3",
    name: "Rose Turkish Delight 250g",
    category: "Sweets",
    price: 5,
    displayPrice: "$5.00",
    stock: 40,
    image:
      "/products/turkish-delight.png",
    badge: "Budget Pick",
    rating: 4.7,
    description:
      "Traditional rose-flavoured Turkish delight.",
    reason:
      "Our most affordable traditional sweet.",
    keywords: [
      "turkish delight",
      "rose",
      "sweet",
      "dessert",
    ],
  },
  {
    id: "4",
    name: "Turkish Style Yogurt 2kg",
    category: "Dairy",
    price: 7,
    displayPrice: "$7.00",
    stock: 12,
    image: "/products/yogurt.png",
    badge: "Family Choice",
    rating: 4.8,
    description:
      "Thick Turkish-style yogurt.",
    reason:
      "A large family-size pack.",
    keywords: [
      "yogurt",
      "yoghurt",
      "dairy",
      "breakfast",
    ],
  },
  {
    id: "5",
    name: "Halal Beef Sucuk 500g",
    category: "Halal Meat",
    price: 13.6,
    displayPrice: "$13.60",
    stock: 9,
    image: "/products/sucuk.png",
    badge: "Halal Choice",
    rating: 4.9,
    description:
      "Spiced halal beef sucuk.",
    reason:
      "A speciality halal meat product.",
    keywords: [
      "sucuk",
      "beef",
      "halal",
      "meat",
      "sausage",
    ],
  },
  {
    id: "6",
    name: "Dubai Chocolate",
    category: "Sweets",
    price: 10,
    displayPrice: "$10.00",
    stock: 15,
    image:
      "/products/dubai-chocolate.png",
    badge: "Premium Pick",
    rating: 4.9,
    description:
      "Premium chocolate dessert.",
    reason:
      "A premium modern dessert option.",
    keywords: [
      "dubai chocolate",
      "chocolate",
      "dessert",
      "sweet",
    ],
  },
];

/* =========================================================
   CHATBOT HELPERS
========================================================= */

function createBotResponse(
  text,
  recommendedProducts = []
) {
  return {
    text,
    recommendedProducts,
  };
}

function getProductsByIds(ids) {
  return CLARIMART_PRODUCTS.filter(
    (product) =>
      ids.includes(product.id)
  );
}

function getBotReply(userText) {
  const message = String(
    userText || ""
  )
    .toLowerCase()
    .trim();

  const matchedProduct =
    CLARIMART_PRODUCTS.find(
      (product) =>
        product.keywords.some(
          (keyword) =>
            message.includes(keyword)
        )
    );

  if (
    message === "hi" ||
    message === "hello" ||
    message === "hey"
  ) {
    return createBotResponse(
      "Hi! I’m ClariBot, your ClariMart shopping assistant."
    );
  }

  if (
    message.includes("breakfast") ||
    message.includes("morning")
  ) {
    return createBotResponse(
      "For breakfast, I recommend honey, yogurt and tahini.",
      getProductsByIds(["2", "4", "1"])
    );
  }

  if (
    message.includes("sweet") ||
    message.includes("dessert") ||
    message.includes("chocolate")
  ) {
    return createBotResponse(
      "Here are some sweet recommendations.",
      getProductsByIds(["3", "6", "2"])
    );
  }

  if (
    message.includes("halal") ||
    message.includes("meat") ||
    message.includes("sucuk")
  ) {
    return createBotResponse(
      "I recommend Halal Beef Sucuk.",
      getProductsByIds(["5"])
    );
  }

  if (matchedProduct) {
    return createBotResponse(
      `${matchedProduct.name} is available for ${matchedProduct.displayPrice}. ${matchedProduct.reason}`,
      [matchedProduct]
    );
  }

  if (
    message.includes("delivery") ||
    message.includes("shipping")
  ) {
    return createBotResponse(
      "Standard delivery is $8.99 and free for orders over $50. Express delivery is $14.99. Store pickup is free."
    );
  }

  if (
    message.includes("checkout") ||
    message.includes("payment") ||
    message.includes("card")
  ) {
    return createBotResponse(
      "Use demo card number 4242 4242 4242 4242, expiry 12/30 and CVV 123."
    );
  }

  if (
    message.includes("refund") ||
    message.includes("return")
  ) {
    return createBotResponse(
      "Select Returns / Refunds, enter your order number and choose the exact item."
    );
  }

  return createBotResponse(
    "I can help with products, delivery, checkout, order tracking and returns."
  );
}

/* =========================================================
   BASIC ROUTE
========================================================= */

app.get("/", (req, res) => {
  res.send(
    "ClariBot backend is running"
  );
});

/* =========================================================
   ADMIN LOGIN
========================================================= */

app.post(
  "/api/admin/login",
  (req, res) => {
    const { email, password } =
      req.body;

    if (
      email !==
        "admin@claribot.com" ||
      password !== "admin123"
    ) {
      return res.status(401).json({
        message:
          "Invalid admin credentials",
      });
    }

    const admin = {
      id: "admin-1",
      name: "Admin",
      email,
      role: "admin",
    };

    return res.json({
      message:
        "Admin login successful",
      token: createToken(admin),
      user: admin,
    });
  }
);

/* =========================================================
   CUSTOMER AUTHENTICATION
========================================================= */

app.post(
  "/api/auth/request-otp",
  async (req, res) => {
    try {
      const db = readDB();

      const email = normalizeEmail(
        req.body.email
      );

      if (!email) {
        return res.status(400).json({
          message:
            "Email is required",
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({
          message:
            "Please enter a valid email address",
        });
      }

      const existingUser =
        db.users.find(
          (user) =>
            normalizeEmail(
              user.email
            ) === email &&
            user.role ===
              "customer"
        );

      if (existingUser) {
        return res.status(409).json({
          message:
            "User already exists with this email",
        });
      }

      const otp = Math.floor(
        100000 +
          Math.random() * 900000
      ).toString();

      db.otps = db.otps.filter(
        (item) =>
          item.email !== email
      );

      db.otps.push({
        email,
        otp,
        expiresAt:
          Date.now() +
          10 * 60 * 1000,
        createdAt:
          new Date().toISOString(),
      });

      writeDB(db);

      await sendOtpEmail(
        email,
        otp
      );

      return res.json({
        ok: true,
        message:
          "OTP sent to your email successfully.",
      });
    } catch (error) {
      console.error(
        "Request OTP error:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "Failed to send OTP email.",
      });
    }
  }
);

app.post(
  "/api/auth/signup",
  async (req, res) => {
    try {
      const db = readDB();

      const name = String(
        req.body.name || ""
      ).trim();

      const email = normalizeEmail(
        req.body.email
      );

      const password = String(
        req.body.password || ""
      );

      const otp = String(
        req.body.otp || ""
      ).trim();

      if (
        !name ||
        !email ||
        !password ||
        !otp
      ) {
        return res.status(400).json({
          message:
            "Name, email, password and OTP are required",
        });
      }

      if (!isValidEmail(email)) {
        return res.status(400).json({
          message:
            "Please enter a valid email address",
        });
      }

      if (password.length < 6) {
        return res.status(400).json({
          message:
            "Password must be at least 6 characters",
        });
      }

      const existingUser =
        db.users.find(
          (user) =>
            normalizeEmail(
              user.email
            ) === email
        );

      if (existingUser) {
        return res.status(409).json({
          message:
            "User already exists",
        });
      }

      const otpRecord =
        db.otps.find(
          (item) =>
            item.email === email &&
            item.otp === otp
        );

      if (!otpRecord) {
        return res.status(400).json({
          message: "Invalid OTP",
        });
      }

      if (
        Date.now() >
        otpRecord.expiresAt
      ) {
        return res.status(400).json({
          message:
            "OTP has expired.",
        });
      }

      const hashedPassword =
        await bcrypt.hash(
          password,
          10
        );

      const user = {
        id: Date.now().toString(),
        name,
        email,
        password:
          hashedPassword,
        role: "customer",
        emailVerified: true,
        createdAt:
          new Date().toISOString(),
      };

      db.users.push(user);

      db.otps = db.otps.filter(
        (item) =>
          item.email !== email
      );

      writeDB(db);

      return res.status(201).json({
        message:
          "Signup successful",
        token: createToken(user),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(
        "Signup error:",
        error
      );

      return res.status(500).json({
        message: "Signup failed",
      });
    }
  }
);

app.post(
  "/api/auth/login",
  async (req, res) => {
    try {
      const db = readDB();

      const email = normalizeEmail(
        req.body.email
      );

      const password = String(
        req.body.password || ""
      );

      const user = db.users.find(
        (item) =>
          normalizeEmail(
            item.email
          ) === email &&
          item.role === "customer"
      );

      if (!user) {
        return res.status(401).json({
          message:
            "Invalid email or password",
        });
      }

      const passwordMatch =
        await bcrypt.compare(
          password,
          user.password
        );

      if (!passwordMatch) {
        return res.status(401).json({
          message:
            "Invalid email or password",
        });
      }

      return res.json({
        message:
          "Login successful",
        token: createToken(user),
        user: {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        },
      });
    } catch (error) {
      console.error(
        "Login error:",
        error
      );

      return res.status(500).json({
        message: "Login failed",
      });
    }
  }
);

/* =========================================================
   ADMIN SUMMARY AND SETTINGS
========================================================= */

app.get(
  "/api/admin/summary",
  (req, res) => {
    const db = readDB();

    return res.json({
      totalUsers:
        db.users.length,
      totalConversations:
        db.conversations.length,
      resolutionRate: 94,
      escalated: 0,
      leadsCaptured:
        db.leads.length,
      avgResponse: "< 1s",
      sentiment: {
        positive: 0,
        neutral:
          db.conversations.length,
        negative: 0,
      },
    });
  }
);

app.get(
  "/api/admin/settings",
  (req, res) => {
    const db = readDB();

    return res.json(db.settings);
  }
);

app.put(
  "/api/admin/settings",
  (req, res) => {
    const db = readDB();

    db.settings = {
      ...db.settings,
      ...req.body,
    };

    writeDB(db);

    return res.json(db.settings);
  }
);

/* =========================================================
   CONVERSATIONS
========================================================= */

app.get(
  "/api/conversations",
  (req, res) => {
    const db = readDB();

    const conversations = [
      ...db.conversations,
    ].sort(
      (a, b) =>
        new Date(
          b.updatedAt ||
            b.createdAt
        ) -
        new Date(
          a.updatedAt ||
            a.createdAt
        )
    );

    return res.json(
      conversations
    );
  }
);

app.post(
  "/api/conversations",
  (req, res) => {
    const db = readDB();

    const now =
      new Date().toISOString();

    const conversation = {
      id: Date.now().toString(),
      userId:
        req.body.userId ||
        "guest",
      title:
        req.body.title ||
        "New conversation",
      status: "open",
      sentiment: "neutral",
      messages: [],
      createdAt: now,
      updatedAt: now,
    };

    db.conversations.push(
      conversation
    );

    writeDB(db);

    return res
      .status(201)
      .json(conversation);
  }
);

app.post(
  "/api/conversations/:id/messages",
  (req, res) => {
    const db = readDB();

    const conversation =
      db.conversations.find(
        (item) =>
          item.id ===
          req.params.id
      );

    if (!conversation) {
      return res.status(404).json({
        message:
          "Conversation not found",
      });
    }

    const text = String(
      req.body.text || ""
    );

    const userMessage = {
      id: Date.now().toString(),
      role: "user",
      text,
      createdAt:
        new Date().toISOString(),
    };

    const botReply =
      getBotReply(text);

    const botMessage = {
      id: (
        Date.now() + 1
      ).toString(),
      role: "bot",
      text: botReply.text,
      recommendedProducts:
        botReply.recommendedProducts ||
        [],
      createdAt:
        new Date().toISOString(),
    };

    conversation.messages.push(
      userMessage,
      botMessage
    );

    conversation.updatedAt =
      new Date().toISOString();

    writeDB(db);

    return res.json({
      userMessage,
      botMessage,
      reply: botMessage,
      conversation,
    });
  }
);

app.get(
  "/api/admin/conversations",
  (req, res) => {
    const db = readDB();

    return res.json(
      db.conversations.map(
        (conversation) => ({
          ...conversation,
          messageCount:
            conversation.messages
              ?.length || 0,
          updatedAt:
            conversation.updatedAt ||
            conversation.createdAt,
        })
      )
    );
  }
);

app.get(
  "/api/admin/chat-logs",
  (req, res) => {
    const db = readDB();

    return res.json(
      db.conversations
    );
  }
);

app.get(
  "/api/admin/conversations/:id",
  (req, res) => {
    const db = readDB();

    const conversation =
      db.conversations.find(
        (item) =>
          item.id ===
          req.params.id
      );

    if (!conversation) {
      return res.status(404).json({
        message:
          "Conversation not found",
      });
    }

    return res.json(conversation);
  }
);

app.delete(
  "/api/admin/conversations/:id",
  (req, res) => {
    const db = readDB();

    db.conversations =
      db.conversations.filter(
        (item) =>
          item.id !==
          req.params.id
      );

    writeDB(db);

    return res.json({
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
        (item) =>
          item.id !==
          req.params.id
      );

    writeDB(db);

    return res.json({
      ok: true,
    });
  }
);

/* =========================================================
   LEADS AND USERS
========================================================= */

app.post(
  "/api/leads",
  (req, res) => {
    const db = readDB();

    const lead = {
      id: Date.now().toString(),
      email:
        req.body.email || "",
      source:
        req.body.source ||
        "landing",
      name: req.body.name || "",
      subject:
        req.body.subject || "",
      message:
        req.body.message || "",
      createdAt:
        new Date().toISOString(),
    };

    if (!lead.email) {
      return res.status(400).json({
        message:
          "Email is required",
      });
    }

    db.leads.push(lead);

    writeDB(db);

    return res.status(201).json({
      ok: true,
      message:
        "Lead saved successfully",
      lead,
    });
  }
);

app.get(
  "/api/admin/users",
  (req, res) => {
    const db = readDB();

    return res.json(
      db.users.map((user) => ({
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        createdAt:
          user.createdAt,
      }))
    );
  }
);

app.get(
  "/api/admin/leads",
  (req, res) => {
    const db = readDB();

    return res.json(
      [...db.leads].sort(
        (a, b) =>
          new Date(
            b.createdAt
          ) -
          new Date(
            a.createdAt
          )
      )
    );
  }
);

/* =========================================================
   ORDERS
========================================================= */

app.post(
  "/api/orders",
  (req, res) => {
    try {
      const db = readDB();

      const items =
        Array.isArray(
          req.body.items
        )
          ? req.body.items
          : [];

      if (items.length === 0) {
        return res.status(400).json({
          ok: false,
          message:
            "The order must contain at least one product.",
        });
      }

      const customer = {
        name: String(
          req.body.customer?.name ||
            ""
        ).trim(),

        email: normalizeEmail(
          req.body.customer?.email
        ),

        phone: String(
          req.body.customer?.phone ||
            ""
        ).trim(),

        address: String(
          req.body.customer
            ?.address || ""
        ).trim(),
      };

      if (!customer.email) {
        return res.status(400).json({
          ok: false,
          message:
            "Customer email is required.",
        });
      }

      const order = {
        id: `DEMO-${Date.now()}`,
        customer,
        items,
        subtotal: Number(
          req.body.subtotal || 0
        ),
        delivery: Number(
          req.body.delivery || 0
        ),
        total: Number(
          req.body.total || 0
        ),
        deliveryMethod:
          req.body
            .deliveryMethod ||
          "standard",
        paymentStatus:
          "Paid (Demo)",
        orderStatus: "Received",
        createdAt:
          new Date().toISOString(),
      };

      db.orders.push(order);

      writeDB(db);

      return res.status(201).json({
        ok: true,
        message:
          "Demo order created successfully.",
        order,
      });
    } catch (error) {
      console.error(
        "Create order error:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "The demo order could not be saved.",
      });
    }
  }
);

/* =========================================================
   CUSTOMER ORDERS
========================================================= */

app.get(
  "/api/customer/orders",
  (req, res) => {
    try {
      const db = readDB();

      const requestedEmail =
        normalizeEmail(
          req.query.email
        );

      if (!requestedEmail) {
        return res.status(400).json({
          ok: false,
          message:
            "Customer email is required.",
        });
      }

      const orders = (
        db.orders || []
      )
        .filter(
          (order) =>
            normalizeEmail(
              order.customer?.email
            ) === requestedEmail
        )
        .sort(
          (a, b) =>
            new Date(
              b.createdAt
            ).getTime() -
            new Date(
              a.createdAt
            ).getTime()
        );

      return res.json({
        ok: true,
        orders,
      });
    } catch (error) {
      console.error(
        "Customer orders error:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "Customer orders could not be loaded.",
      });
    }
  }
);
app.get("/api/customer/orders", (req, res) => {
  try {
    const db = readDB();

    const requestedEmail = normalizeEmail(req.query.email);

    if (!requestedEmail) {
      return res.status(400).json({
        ok: false,
        message: "Customer email is required.",
      });
    }

    const orders = (db.orders || [])
      .filter(
        (order) =>
          normalizeEmail(order.customer?.email) ===
          requestedEmail
      )
      .sort(
        (a, b) =>
          new Date(b.createdAt).getTime() -
          new Date(a.createdAt).getTime()
      );

    return res.json({
      ok: true,
      orders,
    });
  } catch (error) {
    console.error("Customer orders error:", error);

    return res.status(500).json({
      ok: false,
      message: "Customer orders could not be loaded.",
    });
  }
});

/* =========================================================
   RETURN ITEMS FOR ONE ORDER
========================================================= */

app.get(
  "/api/orders/:id/return-items",
  (req, res) => {
    try {
      const db = readDB();

      const requestedId =
        String(
          req.params.id || ""
        )
          .trim()
          .toLowerCase();

      const order = db.orders.find(
        (item) =>
          String(item.id || "")
            .trim()
            .toLowerCase() ===
          requestedId
      );

      if (!order) {
        return res.status(404).json({
          ok: false,
          message:
            "Order not found.",
        });
      }

      return res.json({
        ok: true,
        order: {
          id: order.id,
          orderStatus:
            order.orderStatus ||
            "Received",
          paymentStatus:
            order.paymentStatus ||
            "Paid (Demo)",
          deliveryMethod:
            order.deliveryMethod ||
            "standard",
          customer:
            order.customer || {},
          items:
            Array.isArray(
              order.items
            )
              ? order.items
              : [],
        },
      });
    } catch (error) {
      console.error(
        "Return items error:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "The order products could not be loaded.",
      });
    }
  }
);

/* =========================================================
   TRACK ONE ORDER
========================================================= */

app.get(
  "/api/orders/:id",
  (req, res) => {
    try {
      const db = readDB();

      const requestedId =
        String(
          req.params.id || ""
        )
          .trim()
          .toLowerCase();

      const order = db.orders.find(
        (item) =>
          String(item.id || "")
            .trim()
            .toLowerCase() ===
          requestedId
      );

      if (!order) {
        return res.status(404).json({
          ok: false,
          message:
            "Order not found. Check the order ID and try again.",
        });
      }

      return res.json({
        ok: true,
        order,
      });
    } catch (error) {
      console.error(
        "Track order error:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "The order could not be loaded.",
      });
    }
  }
);

/* =========================================================
   RETURNS
========================================================= */

app.post(
  "/api/returns",
  (req, res) => {
    try {
      const db = readDB();

      const orderId = String(
        req.body.orderId || ""
      ).trim();

      const productId = String(
        req.body.productId || ""
      ).trim();

      const reason = String(
        req.body.reason || ""
      ).trim();

      if (
        !orderId ||
        !productId ||
        !reason
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "Order ID, product and return reason are required.",
        });
      }

      const order = db.orders.find(
        (item) =>
          String(item.id || "")
            .trim()
            .toLowerCase() ===
          orderId.toLowerCase()
      );

      if (!order) {
        return res.status(404).json({
          ok: false,
          message:
            "Order not found.",
        });
      }

      const product = (
        Array.isArray(
          order.items
        )
          ? order.items
          : []
      ).find(
        (item) =>
          String(item.id) ===
          productId
      );

      if (!product) {
        return res.status(404).json({
          ok: false,
          message:
            "That product was not found in this order.",
        });
      }

      const existingReturn =
        db.returns.find(
          (item) =>
            String(
              item.orderId
            ) ===
              String(
                order.id
              ) &&
            String(
              item.productId
            ) ===
              String(
                product.id
              ) &&
            item.status !==
              "Rejected"
        );

      if (existingReturn) {
        return res.status(409).json({
          ok: false,
          message:
            "A return request already exists for this product.",
          returnRequest:
            existingReturn,
        });
      }

      const returnRequest = {
        id: `RETURN-${Date.now()}`,
        orderId: order.id,
        productId:
          product.id,
        productName:
          product.name,
        quantity: Number(
          product.qty || 1
        ),
        price: Number(
          product.price || 0
        ),
        image:
          product.image || "",
        reason,
        customer:
          order.customer || {},
        status: "Requested",
        createdAt:
          new Date().toISOString(),
      };

      db.returns.push(
        returnRequest
      );

      writeDB(db);

      return res.status(201).json({
        ok: true,
        message:
          "Return request created successfully.",
        returnRequest,
      });
    } catch (error) {
      console.error(
        "Create return error:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "The return request could not be saved.",
      });
    }
  }
);

/* =========================================================
   ADMIN ORDERS AND RETURNS
========================================================= */

app.get(
  "/api/admin/orders",
  (req, res) => {
    const db = readDB();

    const orders = [
      ...db.orders,
    ].sort(
      (a, b) =>
        new Date(
          b.createdAt
        ) -
        new Date(
          a.createdAt
        )
    );

    return res.json(orders);
  }
);

app.get(
  "/api/admin/returns",
  (req, res) => {
    const db = readDB();

    const returns = [
      ...db.returns,
    ].sort(
      (a, b) =>
        new Date(
          b.createdAt
        ) -
        new Date(
          a.createdAt
        )
    );

    return res.json(returns);
  }
);

app.patch(
  "/api/admin/returns/:id",
  (req, res) => {
    try {
      const db = readDB();

      const returnRequest =
        db.returns.find(
          (item) =>
            String(item.id)
              .trim()
              .toLowerCase() ===
            String(
              req.params.id
            )
              .trim()
              .toLowerCase()
        );

      if (!returnRequest) {
        return res.status(404).json({
          ok: false,
          message:
            "Return request not found.",
        });
      }

      const allowedStatuses = [
        "Requested",
        "Approved",
        "Rejected",
        "Completed",
      ];

      const status = String(
        req.body.status || ""
      ).trim();

      if (
        !allowedStatuses.includes(
          status
        )
      ) {
        return res.status(400).json({
          ok: false,
          message:
            "Invalid return status.",
        });
      }

      returnRequest.status =
        status;

      returnRequest.updatedAt =
        new Date().toISOString();

      writeDB(db);

      return res.json({
        ok: true,
        message:
          "Return status updated.",
        returnRequest,
      });
    } catch (error) {
      console.error(
        "Update return error:",
        error
      );

      return res.status(500).json({
        ok: false,
        message:
          "Return status could not be updated.",
      });
    }
  }
);

/* =========================================================
   START SERVER
========================================================= */

const PORT =
  process.env.PORT || 4000;

app.listen(PORT, () => {
  console.log(
    `ClariBot API running on http://localhost:${PORT}`
  );
});