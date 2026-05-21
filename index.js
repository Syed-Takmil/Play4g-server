




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

    app.get("/facilities",async(req,res)=>{
        const result=await Collections.find().toArray()
        res.send(result)
    })
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
