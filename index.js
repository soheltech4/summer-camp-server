const express = require('express')
const app = express()
const cors = require('cors')
require('dotenv').config()
const port = process.env.PORT || 5000



// middleware
app.use(cors())
app.use(express.json())


const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.rbfkgiq.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    await client.connect();

    const usersCollection = client.db("martialDb").collection("users");
    const classesCollection = client.db("martialDb").collection("classes");
    const selectCollection = client.db("martialDb").collection("select");
    const instructorCollection = client.db("martialDb").collection("Instructors");

    app.get('/users',  async(req, res)=> {
      const result = await usersCollection.find().toArray()
      res.send(result)
    })


    app.post('/users', async(req, res)=>{
      const user = req.body
      const query = {email : user.email}
      const existingUser = await usersCollection.findOne(query)
      if(existingUser){
        return res.send({message : 'user already login'})
      }
      const result = await usersCollection.insertOne(user)
      res.send(result)
    })

    app.patch('/users/admin/:id', async(req, res)=>{
      const id = req.params.id
      const filter = {_id: new ObjectId(id)}
      const updateDoc = {
        $set : {
          role : 'admin'
        }
      }
      const result = await usersCollection.updateOne(filter, updateDoc)
      res.send(result)
    })

    app.get('/classes', async (req, res) => {
      const query = {};
      const options = {
        sort: { "totalSeats": -1 },
      };
      const result = await classesCollection.find(query, options).limit(6).toArray()
      res.send(result)
    })

    app.get('/all-classes', async (req, res) => {
      const result = await classesCollection.find().toArray()
      res.send(result)
    })


    app.get('/instructor', async (req, res) => {
      const query = {}
      const options = {
        sort: { "numClassesTaken": -1 },
      };
      const result = await instructorCollection.find(query, options).limit(6).toArray()
      res.send(result)
    })

    app.get('/all-instructors', async (req, res) => {
      const result = await instructorCollection.find().toArray()
      res.send(result)
    })

    app.get('/select', async (req, res) => {
      const email = req.query.email
      if (!email) {
        res.send([])
      }
      const query = { email: email }
      const result = await selectCollection.find(query).toArray()
      res.send(result)
    })

    app.post('/select', async (req, res) => {
      const select = req.body
      const result = await selectCollection.insertOne(select)
      res.send(result)
    })

    app.delete('/select/:id', async (req, res) => {
      const id = req.params.id
      const query = { _id: new ObjectId(id) }
      const result = await selectCollection.deleteOne(query)
      res.send(result)
    })

    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);






app.get('/', (req, res) => {
  res.send('Martial is Running')
})

app.listen(port, () => {
  console.log(`Martial Mastery is Running on ${port}`)
})
