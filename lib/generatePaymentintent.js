import { pool } from "../db";
import dotenv from "dotenv";
import Stripe from "stripe";
import { createPaymentIntent } from "../queries/query";

const stripe = Stripe(process.env.STRIPE_SECRET_KEY);

const generatePaymentIntent = async(orderId, totalPrice) =>{
    const paymentIntent = await stripe.paymentIntents.create({
        amount : totalPrice * 100,
        currency : "inr",
        payment_method_types : [`card`, `upi`]
    });
    try {
        await pool.query(createPaymentIntent, [orderId, "online", "pending", paymentIntent.client_secret]);
        return {success: true, clientSecret : paymentIntent.client_secret};
    } catch (err) {
        console.error(err);
        return {success: false, message: "Payment failed"};
    }
    

};

export default generatePaymentIntent;