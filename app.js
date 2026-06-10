import express, { urlencoded } from "express";
import cors from "cors";
import helmet from "helmet";
import dotenv from "dotenv";
import morgan from "morgan";
import fileUpload from "express-fileupload";
import Stripe from "stripe";
import { createServer} from "http";
import { Server } from "socket.io";
import arcjet, { shield, detectBot, tokenBucket } from "@arcjet/node";


dotenv.config();

const app = express();
const server = createServer(app);
const io = new Server(server, {
    cors : {
        origin : [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
        credentials: true,
        methods: ['GET', 'POST'],
    }
})

const aj = arcjet({
  key: process.env.ARCJET_KEY,
  characteristics : ["ip.src"],
  rules: [
    shield({ mode: "LIVE" }),
    detectBot({
      mode: "LIVE",
      allow: [
        "CATEGORY:SEARCH_ENGINE", 
      ],
    }),
    tokenBucket({
      refillRate: 5, 
      interval: 5, 
      capacity: 10, 
    }),
  ],
});
app.use(helmet({
    contentSecurityPolicy:false
}));
app.use(morgan());
app.use(cors(
    {
        origin : [process.env.FRONTEND_URL, process.env.DASHBOARD_URL],
        credentials: true,
        methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
        allowedHeaders: ['Content-Type', 'Authorization']
    }
));
app.use(express.json());


app.use(fileUpload({
    tempFileDir : '/uploads',
    useTempFiles: true
}))

io.on("connection", (socket) =>{
    console.log("a user is connected : " + socket.id)
    socket.on("joinAdminRoom", ()=>{
    socket.join("adminRoom");
    })
})

app.use(express.urlencoded({extended: true}));

export {aj, app, server, io};

