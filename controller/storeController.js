import { pool } from "../db.js";


export const toggleStore= async(req,res) =>{

    try {
       const status = req.params.status;
       await pool.query(`UPDATE store_settings SET is_store_open = $1 WHERE id = 1`, [status]);
       res.status(200).json({success : true, message : `Store status updated Successfully` });
    } catch (err) {
        console.log(err);
        res.status(500).json({success : false, message : "Internal Server Error"});
    }
}

export const getStoreStatus = async(req,res) =>{
    try {
        const result = await pool.query(`SELECT * FROM store_settings WHERE id = 1`);
        return res.status(200).json({success:true, data : result[0] })
    } catch (err) {
        console.log(err);
        return res.status(500).json({success : false, message : "Internal Server Error"});
    }
}

export const toggleISBT = async(req,res) =>{
    try {
        const status = req.params.status;
        await pool.query(`UPDATE store_settings SET is_isbt_delivery_enabled = $1 WHERE id = 1`, [status]);
        res.status(200).json({success : true, message : `ISBT status updated Successfully` });
    } catch (err) {
        console.log(err);
        res.status(500).json({success : false, message : "Internal Server Error"});
    }
}