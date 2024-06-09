const express = require("express");
const {MongoClient} = require("mongodb");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");
dotenv.config();

const port = process.env.PORT || 3000;

const client = new MongoClient(process.env.MONGO_URL);

const server = express();

const corsOptions = {
    origin: true, // Allow requests from any origin
    credentials: true, // Allow credentials (cookies, authorization headers)
};

async function InitiateDatabase(){
    await client.connect();
    console.log("Database Connected Successfully");
}

async function ConnectToServer(){
    server.listen(port,()=>{
        console.log(`Connected to Server Successfully! http://localhost:${port}`)
    })
    server.use(cors(corsOptions));
    server.use(express.json());
    server.use(cookieParser());
    server.use("/",require("./endpoints"));
    server.use("/",require("./userLoginRegister"));
}


async function init(){
    await InitiateDatabase();
    await ConnectToServer();
}

init();

module.exports = client;

