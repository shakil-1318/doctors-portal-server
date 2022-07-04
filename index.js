const express = require('express')
const ObjectId = require('mongodb').ObjectId;
const { MongoClient, ServerApiVersion } = require('mongodb');
const cors = require('cors');
const app = express();
require('dotenv').config();
const port = process.env.PORT || 5000;


// middleware
app.use(cors());
app.use(express.json());

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ssi7z.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });
// console.log(client);

async function run() {
  try {
    await client.connect();
    const database = client.db('doctors_portal');
    const servicesCollection = database.collection('services');
    const reviewsCollection = database.collection('reviews');
    const usersCollection = database.collection('users');
    const appointmentsCollection = database.collection('appointments');

    // get all services api
    app.get('/services', async (req, res) => {
      const cursor = servicesCollection.find({});
      const services = await cursor.toArray();
      res.json(services);
    })
    // get all reviews api
    app.get('/reviews', async (req, res) => {
      const cursor = reviewsCollection.find({});
      const services = await cursor.toArray();
      res.json(services);
    })
    // get admin users api
    app.get('/users/:email', async (req, res) => {
      const email = req.params.email;
      const query = { email: email };
      const user = await usersCollection.findOne(query);
      let isAdmin = false;
      if (user?.role === 'admin') {
        isAdmin = true;
      }
      res.json({ admin: isAdmin });
    })

    // // GET API
    app.get('/appointment', async (req, res) => {
      const email = req.query.email;
      const date = new Date(req.query.date).toLocaleDateString();
      const query = { email: email, date: date };
      const cursor = appointmentsCollection.find(query);
      const appointments = await cursor.toArray();
      res.json(appointments);
    })
    // manageAll order get api
    app.get('/appointments', async (req, res) => {
      const result = await appointmentsCollection.find({}).toArray();
      res.send(result);

    })




    // POST API
    app.post('/appointments', async (req, res) => {
      const appointment = req.body;
      const result = await appointmentsCollection.insertOne(appointment);
      console.log(result);
      res.json(result);
    })
    // user post api
    app.post('/users', async (req, res) => {
      const user = req.body;
      const result = await usersCollection.insertOne(user);
      res.json(result);
    })
    // appointment service add post api
    app.post('/addappointment', async (req, res) => {
      const product = req.body;
      const result = await servicesCollection.insertOne(product);
      res.json(result);
    })
    // review post api
    app.post('/review', async (req, res) => {
      const review = req.body;
      const result = await reviewsCollection.insertOne(review);
      res.json(result);
    })

    // user put api
    app.put('/users', async (req, res) => {
      const user = req.body;
      const filter = { email: user.email };
      const options = { upsert: true };
      const updateDoc = { $set: user };
      const result = await usersCollection.updateOne(filter, updateDoc, options);
      res.json(result);
    })

    // user role update api
    app.put('/users/admin', async (req, res) => {
      const user = req.body;
      const filter = { email: user?.email };
      const updateDoc = { $set: { role: 'admin' } };
      const result = await usersCollection.updateOne(filter, updateDoc);
      res.json(result);
    })


    // update status api
    app.put('/updateStatus/:id', async (req, res) => {
      const id = req.params.id;
      const updateStatus = req.body.status;
      const filter = { _id: ObjectId(id) };
      const result = await appointmentsCollection.updateOne(filter, {
        $set: { status: updateStatus }
      })
      res.send(result);
    })

  }
  finally {
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('Hello doctors portal uncle')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})