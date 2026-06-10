import { pool } from "../db.js";
import { averageNumberRating, purchaseVerification, ratingDelete, ratingPost, ratingUpdate, reviewsVerification } from "../queries/query.js";

export const postReview = async(req,res) =>{
    const user= req.user.id;
    const {rating, comment}= req.body;
    const {product, order} = req.params;
    try {
        if(!rating){
         return   res.status(403).json({success : false, message: "Please select the rating in order to post the comment"});
        }
        const purchasedProduct = await pool.query(purchaseVerification, [user, product]);
        if(purchasedProduct.length === 0 ){
        return    res.status(404).json({success: false, message: "You can't rate this item as no purchase have been made for this item"});
        }
        const reviewCheck = await pool.query(reviewsVerification, [product, order]);
        if(reviewCheck.length > 0){
        return    res.status(403).json({success: false, message: "This product have been already rated and cannot be rated again", review: reviewCheck});
        }
        const postRating = await pool.query(ratingPost, [product, user,rating, comment]);

        const averageRating = await pool.query(averageNumberRating,[product]);
        const newRating = averageRating[0].avg_rating;
        const updatedRating = await pool.query(ratingUpdate, [newRating, product]);
      return  res.status(200).json({success: true, message: "User posted the ratings successfully", postRating, updatedRating})
        
    } catch (err) {
        console.log(err);
    }
};

export const deleteReview = async(req,res)=>{
    const {product, order} = req.params;

    try {
        const resdel = await pool.query(ratingDelete, [order, product]);
        res.status(200).json({success: true, message : `review deleted for product_id: ${resdel[0].product_id}`})
    } catch (err) {
        
    }
}