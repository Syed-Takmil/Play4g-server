

const express = require("express");
const app = express();
const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT || 5000;

// FIX CORS: Added flexible headers and options processing
app.use(
  cors()
);

app.use(express.json());

const { MongoClient, ServerApiVersion, ObjectId } = require("mongodb");
const { createRemoteJWKSet, jwtVerify } = require("jose-cjs");


const uri = process.env.MONGODB_URI;
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const JWKS = createRemoteJWKSet(
  new URL("https://assignment-09-play4g.vercel.app/api/auth/jwks")
);


// VERIFY TOKEN MIDDLEWARE
const verifyToken = async (req, res, next) => {
  const authHeader = req?.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "Unauthorized" });
  }
  const token = authHeader.split(" ")[1];
  if (!token) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  try {
    const { payload } = await jwtVerify(token, JWKS);
    console.log(payload);
    next();
  } catch (error) {
    return res.status(403).json({ message: "Forbidden" });
  }
};

// Global DB variables for caching connection in serverless deployment
let db;
let Collections;
let BookingCollections;

async function getDB() {
  if (db) return { Collections, BookingCollections };
  await client.connect();
  db = client.db("Play4g");
  Collections = db.collection("Facilities");
  BookingCollections = db.collection("Bookings");
  console.log("MongoDB connected successfully");
  return { Collections, BookingCollections };
}

// Middleware to inject collections on every request safely
app.use(async (req, res, next) => {
  try {
    const collections = await getDB();
    req.collections = collections;
    next();
  } catch (err) {
    console.error("Database connection failed:", err);
    res.status(500).json({ error: "Internal Database Connection Error" });
  }
});

/* --- ALL ROUTES --- */

app.get("/facilities", async (req, res) => {
  const { Collections } = req.collections;
  const search = req.query.search || "";
  const sportType = req.query.sportType || "";
  let query = {};

  if (search) {
    query.facility_name = { $regex: search, $options: "i" };
  }
  if (sportType) {
    query.facility_type = { $in: [sportType] };
  }

  const result = await Collections.find(query).toArray();
  res.send(result);
});

app.get("/facilityDetails/:id", verifyToken,async (req, res) => {
  const { Collections } = req.collections;
  const { id } = req.params;
  try {
    const result = await Collections.findOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    res.status(400).send({ error: "Invalid Object ID structure" });
  }
});

app.post("/facilities",verifyToken, async (req, res) => {
  const { Collections } = req.collections;
  const Facility = req.body;
  console.log(Facility)
  const result = await Collections.insertOne(Facility);
  res.send(result);
});

app.patch("/facilityDetails/:id",verifyToken, async (req, res) => {
  const { Collections } = req.collections;
  const { id } = req.params;
  const UpdatedData = req.body;
  delete UpdatedData._id;

  try {
    const result = await Collections.updateOne(
      { _id: new ObjectId(id) },
      { $set: UpdatedData }
    );
    res.send(result);
  } catch (err) {
    res.status(400).send({ error: "Invalid Object ID structure" });
  }
});

app.delete("/facilityDetails/:id",verifyToken, async (req, res) => {
  const { Collections } = req.collections;
  const { id } = req.params;
  try {
    const result = await Collections.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    res.status(400).send({ error: "Invalid Object ID structure" });
  }
});

app.post("/bookings",verifyToken,  async (req, res) => {
  const { BookingCollections } = req.collections;
  const booking = req.body;
  const result = await BookingCollections.insertOne(booking);
  res.send(result);
});

app.get("/bookings",verifyToken,  async (req, res) => {
  const { BookingCollections } = req.collections;
  const result = await BookingCollections.find().toArray();
  res.send(result);
});

app.delete("/bookings/:id", async (req, res) => {
  const { BookingCollections } = req.collections;
  const { id } = req.params;
  try {
    const result = await BookingCollections.deleteOne({ _id: new ObjectId(id) });
    res.send(result);
  } catch (err) {
    res.status(400).send({ error: "Invalid Object ID structure" });
  }
});

app.get("/", (req, res) => {
  res.send("Play4G Server Running");
});

// LOCAL ONLY RUNNER
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;