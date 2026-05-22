
const express = require("express");
const app = express();

const cors = require("cors");
const dotenv = require("dotenv");
dotenv.config();

const port = process.env.PORT || 5000;

app.use(
  cors({
    origin: [
      "http://localhost:3000",
      "https://assignment-09-play4g.vercel.app",
    ],
    credentials: true,
  })
);

app.use(express.json());

const {
  MongoClient,
  ServerApiVersion,
  ObjectId,
} = require("mongodb");

const {
  createRemoteJWKSet,
  jwtVerify,
} = require("jose-cjs");

const uri = process.env.MONGODB_URI;

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  },
});

const JWKS = createRemoteJWKSet(
  new URL(`${process.env.CLIENT_URL}/api/auth/jwks`)
);

// VERIFY TOKEN MIDDLEWARE
const verifyToken = async (req, res, next) => {
  const authHeader = req.headers?.authorization;

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

  try {
    const { payload } = await jwtVerify(token, JWKS);

    console.log(payload);

    req.user = payload;

    next();
  } catch (error) {
    return res.status(403).json({
      message: "Forbidden",
    });
  }
};

async function run() {
  try {
    const db = client.db("Play4g");

    const Collections = db.collection("Facilities");

    const BookingCollections = db.collection("Bookings");

    // GET ALL FACILITIES
    app.get("/facilities", async (req, res) => {
      const search = req.query.search || "";

      const sportType = req.query.sportType || "";

      let query = {};

      // SEARCH
      if (search) {
        query.facility_name = {
          $regex: search,
          $options: "i",
        };
      }

      // FILTER
      if (sportType) {
        query.facility_type = {
          $in: [sportType],
        };
      }

      const result = await Collections.find(query).toArray();

      res.send(result);
    });

    // GET SINGLE FACILITY
    app.get(
      "/facilityDetails/:id",
      verifyToken,
      async (req, res) => {
        const { id } = req.params;

        const result = await Collections.findOne({
          _id: new ObjectId(id),
        });

        res.send(result);
      }
    );

    // ADD FACILITY
    app.post("/facilities", async (req, res) => {
      const Facility = req.body;

      const result = await Collections.insertOne(Facility);

      res.send(result);
    });

    // UPDATE FACILITY
    app.patch(
      "/facilityDetails/:id",
      async (req, res) => {
        const { id } = req.params;

        const UpdatedData = req.body;

        delete UpdatedData._id;

        const result = await Collections.updateOne(
          {
            _id: new ObjectId(id),
          },
          {
            $set: UpdatedData,
          }
        );

        res.send(result);
      }
    );

    // DELETE FACILITY
    app.delete(
      "/facilityDetails/:id",
      async (req, res) => {
        const { id } = req.params;

        const result = await Collections.deleteOne({
          _id: new ObjectId(id),
        });

        res.send(result);
      }
    );

    // CREATE BOOKING
    app.post(
      "/bookings",
      verifyToken,
      async (req, res) => {
        const booking = req.body;

        const result =
          await BookingCollections.insertOne(booking);

        res.send(result);
      }
    );

    // GET BOOKINGS
    app.get(
      "/bookings",
      verifyToken,
      async (req, res) => {
        const result =
          await BookingCollections.find().toArray();

        res.send(result);
      }
    );

    // DELETE BOOKING
    app.delete(
      "/bookings/:id",
      async (req, res) => {
        const { id } = req.params;

        const result =
          await BookingCollections.deleteOne({
            _id: new ObjectId(id),
          });

        res.send(result);
      }
    );

    app.get("/", (req, res) => {
      res.send("Play4G Server Running");
    });

    console.log(
      "MongoDB connected successfully"
    );
  } finally {
  }
}

run().catch(console.dir);

// LOCAL ONLY
if (process.env.NODE_ENV !== "production") {
  app.listen(port, () => {
    console.log(`Server running on port ${port}`);
  });
}

module.exports = app;
