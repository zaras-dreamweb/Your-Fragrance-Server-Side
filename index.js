const express = require('express');
const cors = require('cors');
const jwt = require('jsonwebtoken');
const port = process.env.PORT || 5000;
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
const app = express();
require('dotenv').config();


// middleware
app.use(cors());
app.use(express.json());


// token verification
function verifyToken(req, res, next) {
    const headerToken = req.headers.authorization;
    if (!headerToken) {
        return res.status(401).send({ message: 'Unauthorized Access' });
    }
    const token = headerToken.split(' ')[1];
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, decoded) => {
        if (err) {
            return res.status(403).send({ message: 'Forbidden Access' });
        }
        console.log('decoded', decoded);
        req.decoded = decoded;
        next();
    })
};



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.7sjmt.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true, serverApi: ServerApiVersion.v1 });

async function run() {
    try {
        await client.connect();
        const perfumesCollection = client.db('perfume-11').collection('perfumes');


        // load all data 
        app.get('/perfumes', async (req, res) => {
            console.log('query', req.query);
            const exactPage = parseInt(req.query.exactPage);
            const size = parseInt(req.query.size);
            const query = {};
            const cursor = perfumesCollection.find(query);
            let perfumes;
            if (exactPage || size) {
                perfumes = await cursor.skip(exactPage * size).limit(size).toArray();
            }
            else {
                perfumes = await cursor.toArray();
            }
            res.send(perfumes);
        });

        // for pagination
        app.get('/perfumesCountItem', async (req, res) => {
            const count = await perfumesCollection.estimatedDocumentCount();
            res.send({ count });
        });

        // load single data
        app.get('/perfume/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const perfume = await perfumesCollection.findOne(query);
            res.send(perfume);
        });

        // add item
        app.post('/perfume', async (req, res) => {
            const newPerfume = req.body;
            const result = await perfumesCollection.insertOne(newPerfume);
            res.send(result);
        });

        // jwt
        app.post('/login', async (req, res) => {
            const user = req.body;
            const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '1d' });
            res.send({ accessToken });
        });

        // My Item Api for different emails
        app.get('/perfume', verifyToken, async (req, res) => {
            const decodedEmail = req.decoded.email;
            const email = req.query.email;
            if (decodedEmail === email) {
                const query = { email: email };
                const cursor = perfumesCollection.find(query);
                const perfumes = await cursor.toArray();
                res.send(perfumes);
            }
            else {
                res.status(403).send({ message: 'Forbidden Access' });
            }

        });




        // Update items 
        app.put('/perfume/:id', async (req, res) => {
            const id = req.params.id;
            const newQuantity = req.body.newQuantity;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updatedPerfumeQuantity = {
                $set: {
                    quantity: newQuantity
                }
            };
            const result = await perfumesCollection.updateOne(filter, updatedPerfumeQuantity, options)
            res.send(result);
        });

        // delete item
        app.delete('/perfume/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await perfumesCollection.deleteOne(query);
            res.send(result);
        });



    }
    finally {

    }
}
run().catch(console.dir);



app.get('/', (req, res) => {
    res.send('Show my Perfume Project');
});

app.listen(port, () => {
    console.log("Show my Port", port);
});
