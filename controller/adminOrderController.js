import { pool } from "../db.js"
import { 
    getLiveOrdersCountQuery, 
    getLiveOrdersDetailsQuery, 
    getLiveOrderByIdQuery, 
    updateOrderStatusPreparingQuery, 
    updateOrderStatusPackedQuery, 
    updateOrderStatusCompletedQuery, 
    updateOrderStatusDefaultQuery, 
    getCompletedOrdersTodayCountQuery, 
    getCompletedOrdersByIdQuery, 
    getCompletedOrdersByPhoneQuery, 
    getCompletedOrdersAllQuery 
} from "../queries/query.js";

import {razorpay} from "../index.js"

export const getLiveOrders = async (req, res) => {
    try {
        const countRes = await pool.query(getLiveOrdersCountQuery);
        const count = countRes[0].count;
        const orderRes = await pool.query(getLiveOrdersDetailsQuery);
        res.status(200).json({success : true, order: orderRes || [], count: count})
    } catch (err) {
        console.log(err);
        res.status(500).json({success: false, message: "Failed to fetch live orders", error: err.message});
    }
};

export const getLiveOrderById = async(req,res)=>{
    const {id} = req.params;
    try {
        const orderRes = await pool.query(getLiveOrderByIdQuery, [id]);
        if(!orderRes || orderRes.length === 0){
            return res.status(404).json({success: false, message: "Order not found"});
        }
        res.status(200).json({success : true, order: orderRes[0]})
    } catch (err) {
        console.log(err);
        res.status(500).json({success: false, message: "Failed to fetch order", error: err.message});
    }
}

export const updateStatus = async(req,res)=>{
    const {id, status} = req.params;
    const time = req.body.time
    try {
        if(status === "Preparing"){
             await pool.query(updateOrderStatusPreparingQuery, [status, Number(time),req.user.id, id]);
        } else if(status === "Packed"){
             await pool.query(updateOrderStatusPackedQuery, [status, id]);
        } else if(status === "Completed"){
             await pool.query(updateOrderStatusCompletedQuery, [status, id]);
        } else {
             await pool.query(updateOrderStatusDefaultQuery, [status, id]);
        }
        res.status(200).json({success: true, message: `Order status of order ID ${id.slice(-8)} changed to ${status}`});
    } catch (err) {
        console.log(err);
    }
}

export const getCompletedOrders = async(req,res)=>{
    const {id, phone} = req.query;
    const page = req.query.page || 1;
    const limit = 20;
    const offset = (page-1)*limit; 
    try {
        if(id){
           const countResToday = await pool.query(getCompletedOrdersTodayCountQuery);
            const orderRes = await pool.query(getCompletedOrdersByIdQuery, [id,limit, offset]);  
       res.status(200).json({success: true, count : countResToday[0].count, data: orderRes});
        }
        if(phone){
           const countResToday = await pool.query(getCompletedOrdersTodayCountQuery);
            const orderRes = await pool.query(getCompletedOrdersByPhoneQuery, [phone,limit, offset]); 
        res.status(200).json({success: true, count : countResToday[0].count, data: orderRes});
        }else{
        const countResToday = await pool.query(getCompletedOrdersTodayCountQuery);
        const orderRes = await pool.query(getCompletedOrdersAllQuery, [limit, offset]);
    res.status(200).json({success: true, count : countResToday[0].count, data: orderRes});    
    }
    } catch (err) {
        console.log(err)
    }
}

export const getOrderByID = async(req, res)=>{
    const {id}= req.params;
    
    {
        try {
            const orderRes= await pool.query(`SELECT  s.*,o.*,json_agg(json_build_object('user_id', c.id,'customer_email',c.email, 'hadler_name', a.name,'handler_email', a.email)) AS additional_info, json_agg(json_build_object('item_id', oi.id, 'product_id', oi.product_id, 'quantity', oi.quantity, 'item_name', p.name, 'rating', r.rating, 'comment', r.comment, 'amount', oi.price )) AS items FROM orders o JOIN shipping_info s ON o.id = s.order_id LEFT JOIN "user" a ON o.accepted_by_id = a.id LEFT JOIN "user" c ON o.buyer_id = c.id JOIN order_items oi ON o.id= oi.order_id JOIN products p ON oi.product_id = p.id LEFT JOIN reviews r ON oi.id = r.order_item_id WHERE o.id = $1 GROUP BY o.id, s.id, c.email, a.name, a.email;`,[id]);
            if(orderRes.length == 0){
                return res.status(404).json({success: false, message: "No order found"})
            }
            res.status(200).json({success : true, data: orderRes[0]});
        } catch (err) {
            console.log(err);
        }
    }
}

export const cancelOrder = async(req,res) =>{
    const id = req.params.id;
    const {amount} = req.body;
    try {
        const paymentRes = await pool.query('SELECT payment_intent_id FROM payments WHERE order_id = $1',[id]);
        if(!paymentRes){
         return   res.status(404).json({success: false, message : "No order found in the database please contact reach out support"});
        }
        const payment = await razorpay.orders.fetchPayments(paymentRes[0].payment_intent_id);
        const paymentId = payment.items[0].id;
        const refund  = await razorpay.payments.refund(paymentId, {
            amount : amount *100
        });
        await pool.query('UPDATE orders SET order_status = $1, total_price = total_price - $2 WHERE id = $3', ['Cancelled', amount, id]);
        await pool.query('UPDATE products p SET stock = stock + oi.quantity FROM order_items oi WHERE p.id = oi.product_id AND oi.order_id = $1', [id]);
         return res.status(200).json({success: true, message : `Order # ${id.slice(-8)} have been cancelled and the refund of ₹${amount} have been processed successfully`});
        
    } catch (err) {
       res.status(400).json({success: false, message: err.error.description});
    }
    
}
export const refundOrder = async(req,res)=>{
        const id = req.params.id;
        const {amount, notes} = req.body;
        try {
            const paymentRes = await pool.query('SELECT payment_intent_id FROM payments WHERE order_id = $1',[id]);
            if(!paymentRes){
         return   res.status(404).json({success: false, message : "No order found in the database please contact reach out support"});
        }
        const payment = await razorpay.orders.fetchPayments(paymentRes[0].payment_intent_id)
        const paymentId = payment.items[0].id;  
        const refund  = await razorpay.payments.refund(paymentId, {
            amount : amount*100,
            reason : notes,
        });
        if(!amount || !notes){
            return res.status(400).json({success: false, message: "Refund amount and notes are required"});
        }
     console.log(refund)
        await pool.query('UPDATE orders SET total_price = total_price - $1, order_notes= $2, refund_info=$3 WHERE id = $4', [ amount, notes, amount, id]);
         return res.status(200).json({success: true, message : `Amount of ₹${amount} have been refunded successfully for Order # ${id.slice(-8)} for the reason : ${notes}`});
        } catch (err) {
            console.log(err)
             res.status(400).json({success: false, message: err.error.description});
        }
    }
    
