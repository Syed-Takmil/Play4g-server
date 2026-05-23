const express = require("express");
const app = express();

const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");

const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://assignment-09-play4g.vercel.app",
    ],
    credentials: true,
    methods: ["GET", "POST", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

app.use(express.json());

const client = new MongoClient(process.env.MONGODB_URI, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const JWKS = createRemoteJWKSet(
  new URL("https://assignment-09-play4g.vercel.app/api/auth/jwks")
);

let db;
let Collections;
let BookingCollections;

async function connectDB() {
  if (db) return;

  await client.connect();

  db = client.db("Play4g");

  Collections = db.collection("Facilities");
  BookingCollections = db.collection("Bookings");

  console.log("MongoDB connected successfully");
}

connectDB();

const verifyToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    const token = authHeader.split(" ")[1];

    if (!token) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }

    console.log("TOKEN:", token);

    const { payload } = await jwtVerify(token, JWKS);

    req.user = payload;

    next();
  } catch (error) {
    console.log(error);

    return res.status(403).json({
      message: "Forbidden",
      error: error.message,
    });
  }
};

app.get("/facilities", async (req, res) => {
  const search = req.query.search || "";
  const sportType = req.query.sportType || "";

  let query = {};

  if (search) {
    query.facility_name = {
      $regex: search,
      $options: "i",
    };
  }

  if (sportType) {
    query.facility_type = {
      $in: [sportType],
    };
  }

  const result = await Collections.find(query).toArray();

  res.send(result);
});

app.get("/facilityDetails/:id", async (req, res) => {
  try {
    const result = await Collections.findOne({
      _id: new ObjectId(req.params.id),
    });

    res.send(result);
  } catch {
    res.status(400).send({
      error: "Invalid ID",
    });
  }
});

app.post("/facilities", verifyToken, async (req, res) => {
  const result = await Collections.insertOne(req.body);

  res.send(result);
});

app.patch("/facilityDetails/:id", verifyToken, async (req, res) => {
  try {
    const updatedData = req.body;

    delete updatedData._id;

    const result = await Collections.updateOne(
      {
        _id: new ObjectId(req.params.id),
      },
      {
        $set: updatedData,
      }
    );

    res.send(result);
  } catch {
    res.status(400).send({
      error: "Invalid ID",
    });
  }
});

app.delete("/facilityDetails/:id", verifyToken, async (req, res) => {
  try {
    const result = await Collections.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.send(result);
  } catch {
    res.status(400).send({
      error: "Invalid ID",
    });
  }
});

app.post("/bookings", async (req, res) => {
  const result = await BookingCollections.insertOne(req.body);

  res.send(result);
});

app.get("/bookings", async (req, res) => {
  const result = await BookingCollections.find().toArray();

  res.send(result);
});

app.delete("/bookings/:id", async (req, res) => {
  try {
    const result = await BookingCollections.deleteOne({
      _id: new ObjectId(req.params.id),
    });

    res.send(result);
  } catch {
    res.status(400).send({
      error: "Invalid ID",
    });
  }
});

app.get("/", (req, res) => {
  res.send("Play4G Server Running");
});

if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;