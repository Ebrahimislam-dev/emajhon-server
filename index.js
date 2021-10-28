const express = require('express');
const { MongoClient } = require('mongodb');

const cors = require('cors');
require('dotenv').config()


const port = process.env.PORT || 7000;
const app = express();


//midleware
app.use(cors())
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.b67bk.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
// console.log(uri);
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });



async function run() {
    try {
        await client.connect()
        // console.log('database connected');
        const database = client.db("online_shop");
        const productCollection = database.collection("products");
        const orderCollection = database.collection("orders");

        //get api
        app.get('/products', async (req, res) => {
            console.log(req.query);
            const cursor = productCollection.find({})
            const page = req.query.page;
            const size = parseInt(req.query.size);
            let products;
            const count = await cursor.count();
            if (page) {
                products = await cursor.skip(page * size).limit(size).toArray();
            }
            else {
                products = await cursor.toArray();
            }
            res.send({
                count,
                products
            });
        })
        //Use Post api get data by keys
        app.post('/products/bykeys', async (req, res) => {
            // console.log(req.body);
            const keys = req.body;
            const query = { key: { $in: keys } };
            const products = await productCollection.find(query).toArray();

            res.json(products)
        })
        //use post Add orders api
        app.post('/orders', async (req, res) => {
            const order = req.body;
            const result = await orderCollection.insertOne(order);

            // console.log('order', order);
            res.json(result);
        })

    }
    finally {
        // await client.close();
    }
}
run().catch(console.dir);

app.get('/', (req, res) => {
    res.send("hello from ema jhon node server")
});


app.listen(port, () => {
    console.log('listing to port', port);
});