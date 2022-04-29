const express = require('express');
const cors = require('cors');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();


// middleware
app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7sjmt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const perfumesCollection = client.db('perfume-11').collection('perfumes');

        // load all data from database
        app.get('/perfumes', async (req, res) => {
            const query = {};
            const cursor = perfumesCollection.find(query);
            const perfumes = await cursor.toArray();
            res.send(perfumes);
        });

        // load single data from database
        app.get('/perfume/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const perfume = await perfumesCollection.findOne(query);
            res.send(perfume);
        })
    }
    finally {

    }
}
run().catch(console.dir);


// POST












app.get('/', (req, res) => {
    res.send('Show my Perfume Project');
});

app.listen(port, () => {
    console.log("Show my Port", port);
});
