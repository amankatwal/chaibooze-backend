import { pool } from "../db.js";

export const getUserStats = async(req,res)=>{
    const {id} = req.params;
    try {
        const userRes = await pool.query(`SELECT COUNT(o.*) as order_count, u.id, u.name, u.email, u.role, u.created_at, json_agg(json_build_object('order_id', o.id, 'total_price', o.total_price, 'order_status', o.order_status, 'created_at', o.created_at, 'refund', o.refund_info)) AS orders FROM "user" u LEFT JOIN orders o ON U.id = o.buyer_id WHERE u.id = $1 GROUP BY u.id`, [id]);
        if(userRes.length === 0 ){
           return res.status(404).json({success : false, message: "User not found"})
        }
        return res.status(200).json({success: true, message: `User stats fetched successfully for user ${userRes[0].name}`, data : userRes[0]});
    } catch (err) {
        console.error(err);
        return res.status(500).json({success : false, message: "Failed to fetch user stats", error: err.message});
    }
}

export const updateUserRole = async(req,res) => {
    const id = req.params.id;
    const {role} = req.body; 
    const admin_id = req.user.id
    try {
      const userRes = await pool.query(`SELECT * FROM "user" WHERE id = $1`, [id]);
      if (userRes.length ===  0){
        return res.status(404).json({success: false , message : "User not found"});
      }
      if(userRes[0].id === admin_id){
        return res.status(400).json({success: false, message: "You cannot change your own role"});
      }
      const roleRes = await pool.query(`UPDATE "user" SET role = $1 WHERE id = $2 RETURNING *`, [role, id]);
      return res.status(200).json({success: true, message: "User role updated successfully", data: roleRes[0]});
    } catch (err) {
        console.error(err);
        return res.status(500).json({success: false, message: "Failed to update user role", error: err.message});
    }
}