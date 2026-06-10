
import { pool } from "../db.js";
import { razorpay } from "../index.js";
import crypto from "crypto";
import {io} from "../app.js";
import { 
  createOrderItemsQuery, 
  createOrderQuery, 
  createPaymentQuery, 
  createShippingInfoQuery, 
  getOrderbyIdQuery, 
  getProductsByIdQuery,
  updatePaymentStatusFailedQuery,
  updatePaymentIntentIdQuery,
  updatePaymentStatusPaidQuery,
  updateOrderStatusAfterPaymentQuery,
  updateOrderStatusAbandonedQuery,
  updateProductStockAfterOrderQuery,
  getCountOrdersByBuyerIdQuery,
  getAllOrdersByBuyerIdQuery
} from "../queries/query.js";

export const createOrder = async(req,res) =>{
    const {items, total_price, tax_price, shipping_price, state, city, country, address, pincode, phone} = req.body;
    const buyer_id = req.user.id;
    const name = req.user.name;
    const storeRes = await pool.query(`SELECT * FROM store_settings WHERE id = 1`);
   
   
    try {
        if (!items || !total_price || tax_price === null || shipping_price === null || !state || !city || !country || !address || !pincode || !phone){
         

         return   res.status(400).json({success : false, message : "Bad request"});
        }
       if(storeRes[0].is_store_open === false){
          return   res.status(503).json({success: false, message : "Store is closed While you were managing your cart, Please try again later"});
       }

        const cart = Array.isArray(items) ? items : [items];
        
        
        const orderRes = await pool.query(createOrderQuery, [buyer_id, total_price, tax_price, shipping_price]);
        const orderId = orderRes[0].id;
        const itemId = cart.map(item => item.id)
        
        const productRes = await pool.query(getProductsByIdQuery, [itemId]);
        
           
          for(const item of cart) {
            const product = productRes.find((p) => p.id === item.id)
    
            if(item.quantity > product.stock){
             return   res.status(400).json({success: false, message : `${item.name} is limited and should not exceed the stock of ${product.stock}`});
                
            }
            await pool.query(createOrderItemsQuery, [orderId, product.id, item.quantity, product.price, product.images[0].url, product.description])
          }

          await pool.query(createShippingInfoQuery, [orderId,name, state, city, country, address, pincode, phone]);
          await pool.query(createPaymentQuery, [orderId, 'Online', 'Pending']);
     return res.status(200).json({
         success:true,
         orderId
      })

    } catch (err) {
      console.log(err)
      res.status(500).json({err})
    }
}

export const processPayment = async(req,res) =>{
    const {orderId}= req.body;
    try {
        const orderRes = await pool.query(getOrderbyIdQuery, [orderId]);
        
        const amount = Number(orderRes[0].total_price) + Number(orderRes[0].tax_price) + Number(orderRes[0].shipping_price)
         try {
            const paymentStatus = await razorpay.orders.create({
            amount: amount*100,
            currency: "INR",
            receipt: `${orderId}`
        });
        const paymentOrderId = paymentStatus.id;
        console.log(paymentStatus)
      await pool.query(updatePaymentIntentIdQuery,[paymentOrderId, orderId]);
          
        res.status(200).json({success:true, paymentStatus})
         } catch (error) {
        
          console.log(error);
            await pool.query(updatePaymentStatusFailedQuery,['Failed', orderId]);
        res.status(500).json({success: false, message: error.message})
         }
        
    } catch (err) {
        console.log(err)
        
    }
}    

export const sendRazorpayKey = async(req,res)=>{
    try {
        const key = process.env.RAZORPAY_API_KEY;                             
        res.status(200).json({success: true, key, message: "Razorpay key fetched successfully"});
    } catch (err) {
        console.error(err);
        res.status(500).json({success: false, message: "Error fetching Razorpay key"}); 
    }
}

export const verifyPayment = async(req,res) =>{
  const {razorpay_order_id, razorpay_payment_id, razorpay_signature, orderId} = req.body;

  try {
    const expectedSignature = crypto.createHmac(`sha256`, process.env.RAZORPAY_SECRET_KEY).update(razorpay_order_id + '|' + razorpay_payment_id).digest(`hex`);
    if(expectedSignature !== razorpay_signature){
      await pool.query(updatePaymentStatusFailedQuery,['Failed', orderId]);
      await pool.query(updateOrderStatusAbandonedQuery,["Abandoned", orderId]);
      return res.status(400).json({success:false, message : "Payment verification failed, If the amount has been deducted from your account, it will be refunded within 5-7 business days. Please try placing the order again or contact support if the issue persists."});

    }
    if(expectedSignature === razorpay_signature){
      await pool.query(updatePaymentStatusPaidQuery,["Paid", orderId]);
      await pool.query(updateOrderStatusAfterPaymentQuery,["Placed", orderId]);
      await pool.query(updateProductStockAfterOrderQuery,[orderId]);
      io.to("adminRoom").emit("newOrder", {orderId, message: "A new order has been placed."})
      return res.status(200).json({success: true, message : `payment verified successfully, your order has been placed successfully and will be prepared shortly.`, order_id : orderId});
     
    }
  } catch (err) {
    console.log(err);
    return res.status(500).json({success: false, message: "Error verifying payment, If the amount has been deducted from your account, it will be refunded within 5-7 business days. Please try placing the order again or contact support if the issue persists."});
  }
}

export const getAllOrders = async(req,res) =>{
  const buyer_id = req.user.id;
   const page = req.query.page || 1;
        const limit = 12;
        const offset = (page - 1) * limit;
  try {
    const countRes = await pool.query(getCountOrdersByBuyerIdQuery, [buyer_id]);
    const allOrdersRes = await pool.query(getAllOrdersByBuyerIdQuery, [buyer_id, limit, offset]);
    res.status(200).json({success: true, message: "Orders fetched successfully", data: allOrdersRes, count : countRes[0].count});
  } catch (err) {
    console.log(err);
    res.status(500).json({success: false, message: "Internal server error"});
  }
}