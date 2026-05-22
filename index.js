




const express=require('express'); 
const app=express();
const port=5000
const cors=require('cors')
const dotenv=require('dotenv')
dotenv.config()
app.use(cors())
app.use(express.json())

const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = process.env.MONGODB_URI

const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    await client.connect();
    
    const db=client.db('Play4g')
    const Collections=db.collection('Facilities')
    const BookingCollections=db.collection('Bookings')

app.get("/facilities", async (req, res) => {

  const search = req.query.search || "";
  const sportType = req.query.sportType || "";

  let query = {};

  // SEARCH BY FACILITY NAME
  if (search) {
    query.facility_name = {
      $regex: search,
      $options: "i"
    };
  }

  // FILTER BY SPORT TYPE
  if (sportType) {
    query.facility_type = {
      $in: [sportType]
    };
  }

  const result = await Collections.find(query).toArray();

  res.send(result);
})
   app.patch("/facilityDetails/:id", async (req, res) => {

  const { id } = req.params;
  const UpdatedData = req.body;
  delete UpdatedData._id;
  const result = await Collections.updateOne(
    { _id: new ObjectId(id) },
    {
      $set: UpdatedData
    }
  );

  res.send(result);
});

  app.delete("/facilityDetails/:id", async (req, res) => {

  const { id } = req.params;
  const result = await Collections.deleteOne(
    { _id: new ObjectId(id) }
  );

  res.send(result);
});


    app.post("/bookings",async(req,res)=>{
        const booking=req.body;
        const result= await BookingCollections.insertOne(booking)
        res.send(result)
    })
    app.delete("/bookings/:id",async(req,res)=>{
        const {id} = req.params
        const result= await BookingCollections.deleteOne({_id: new ObjectId(id)})
        res.send(result)
    })
app.get(
  '/bookings',

  async (req, res, next) => {

    const header = req.headers.authorization;

    console.log(header);

    if (!header) {
      return res.status(401).json({
        message: "Unauthorized Access"
      });
    }

    next();
  },

  async (req, res) => {

    const result = await BookingCollections.find().toArray();

    res.send(result);
  }
)
    app.get('/facilityDetails/:id',async(req,res)=>{
        const {id}= req.params
       const result = await Collections.findOne({ _id: new ObjectId(id), });
        res.send(result)
    })
    app.post("/facilities",async(req,res)=>{
        const Facility=req.body;
        const result=await Collections.insertOne(Facility)
        res.send(result)
    })
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello, World!');
});


app.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});
