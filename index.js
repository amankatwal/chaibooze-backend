import router from "./routes/routes.js";
import {aj, app, server} from "./app.js";
import {v2 as cloudinary} from "cloudinary";
import session from "express-session";
import passport from "passport";
import Razorpay from "razorpay";


const port =process.env.PORT;

app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie :{
        maxAge: 1000*60*60*24*7,
        secure : false
    }
}));

app.use(passport.initialize());
app.use(passport.session());

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLIENT_NAME,
    api_key: process.env.CLOUDINARY_CLIENT_KEY,
    api_secret: process.env.CLOUDINARY_CLIENT_API_SECRET
});

export const razorpay = new Razorpay({
    key_id : process.env.RAZORPAY_API_KEY,
    key_secret: process.env.RAZORPAY_SECRET_KEY
});

app.use(async (req, res, next) =>{
    try {
        const decision = await aj.protect(req, {
            requested : 1
        });
        if (decision.isDenied()){
            if(decision.reason.isRateLimit()){
               return res.status(429).json({error : "To many requests",})
            }
          else  if (decision.reason.isBot()){
              return  res.status(403).json({error : "Bot access denied",});
            }
           else {
           return res.status(403).json({error: "connection forbidden",});
           }
           
        }
        if (decision.results.some(r => r.reason.isBot() && r.reason.isSpoofed())) {
  return res.status(403).json({ error: "Spoof bot detected" });
}

        next();
    } catch (err) {
        console.error(err);
        next(err);
    }
})
app.use('/api',router)

server.listen(port, ()=>{
console.log(`server is running on ${port}`)
})