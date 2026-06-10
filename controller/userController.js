import { pool } from "../db.js";
import bcrypt from "bcrypt";
import { fetchByToken, generatePasswordResetLink, profileUpdate, updatePasswordByToken, userCheckbyEmail, userSignup } from "../queries/query.js";
import { passwordResetToken } from "../lib/passwordResetToken.js";
import sendMail from "../lib/nodemailer.js";
import { passwordResetHTML } from "../lib/passwordResetHTML.js";
import { signUpMail } from "../lib/signupHTML.js";
import crypto from "crypto";

export const signupUser =  (async(req,res) =>{
    
    try {
        const {name, email, password, confirmPassword} = req.body;
        const message = signUpMail(name)
    const userRes = await pool.query(userCheckbyEmail,[email])
        if(userRes.length === 0){
            
                   const hashedPassword = await bcrypt.hash(password, 10);
            if(!name || !email || !password || !confirmPassword){
              return  res.status(400).json({message: "Please fill all the details" });
            }else{
                if(password !== confirmPassword){
                    res.status(400).json({message : "Your password does not match correctly"})
                }
                const user = await pool.query(userSignup, [name, email, hashedPassword]);
                   await sendMail({
            email : email,
            subject : "Welcome to CHaibooze",
            message
})
              return  req.login(user, (err) =>{
            console.error(err);
            
            res.status(200).json({message: "User signed up" ,user : user[0]});
            
         })
                
            }
            
        }else{
           
             res.status(409).json({message : "User already exists"});
         
        }
    } catch (err) {
        console.error(err);
        
    }
});

export const getUser = (req,res) => {
const user = req.user;
 res.status(200).json({ success : true, message : `${user.name.split(' ')[0]} successfully logged in`, data : user});

}


export const logOut = (req,res) =>{
    if(req.isAuthenticated()){
    req.logout((err) =>{
       if(err) {console.log(err);}
        res.json({message: "logged out user"})
    })
}else{
    res.status(401).json({success : false, message : "User not found"});
}};

export const generateLink = async(req,res) =>{
    const {email} = req.body;
    const userRes = await pool.query(userCheckbyEmail, [email]);
    const frontend = process.env.FRONTEND_URL;
    
        if (userRes.length === 0){
            res.status(404).json({message : "No account found with the email"});
          return  console.log(userRes.length)
        }
        const {resetToken, hashedToken, expiryTimeToken} = passwordResetToken();
        await pool.query(generatePasswordResetLink, [hashedToken, expiryTimeToken/1000, email]);
        const user = userRes[0];
        const passwordResetURL = `${frontend}/password/reset/${resetToken}`;
        const message = passwordResetHTML(user, passwordResetURL);
        try {
            
         await sendMail({
            email : user.email,
            subject : "Password Recovery for Chaibooze",
            message
});
res.status(200).json({success : true, message : `email sent to ${user.email} successfully`});
    } catch (err) {
        await pool.query(generatePasswordResetLink, [null, null, email]);
        console.log(err)
        res.status(404).json({
            success : false,
            message : "Something went wrong"
        })
    }
};

export const resetPassword = async(req,res) =>{
    const {token} = req.params;
    const resetToken = crypto.createHash("sha256").update(token).digest("hex");
    const userRes = await pool.query(fetchByToken, [resetToken]);
    try {
        if (userRes.length === 0){
          return   res.status(404).json({success : false , message : "Token expired or invalid token"});
        }
        if (req.body.password !== req.body.confirmPassword){
            res.status(401).json({success : false, message: "Password field does not match"})
        }
        if (req.body.password.length < 8 || req.body.password.length > 16 || req.body.confirmPassword.length < 8 || req.body.confirmPassword.length > 16){
            res.status(401).json({success : false, message:"Password length Should be greater than 8 and smaller than 16"});
        }
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        const updatedUser = await pool.query(updatePasswordByToken, [hashedPassword, userRes[0].id]);
        const user = updatedUser[0];
        req.login(user , (err) =>{
        console.error(err)
        return res.status(200).json({success: true, message : "User Password Updated Successfully", data: user});
        }) 
    } catch (err) {
        console.error(err);
        res.status(404). json({success : false, message: "Something went wrong"});
    }
};

export const updatePassword = async(req,res) =>{
    const {newPassword, confirmPassword, currentPassword} = req.body;
    
    try {
       
            const id = req.user.id;
            const isMatch = await bcrypt.compare(currentPassword, req.user.password); 
       if(!newPassword || !confirmPassword || !currentPassword){
       return res.status(403).json({success: false, message: "Please fill all the details"});
       }
       if(newPassword !== confirmPassword){
        return res.status(401).json({success : false, message: "New Password field does not match"});
       };
       if(newPassword === currentPassword){
       return res.status(403).json({success: false, message : "Current password and the new Password should not match"});
       }
       if (newPassword.length < 8 || newPassword.length > 16 || confirmPassword.length < 8 || confirmPassword.length > 16){
           return res.status(401).json({success : false, message:"Password length Should be greater than 8 and smaller than 16"});
        }
     if(!isMatch){
      return  res.status(403).json({success : false, message:"Please enter the correct current password"});
     }
     const hashedPassword = await bcrypt.hash(newPassword, 10);
        const updatedUser = await pool.query(updatePasswordByToken, [hashedPassword, id]);
        const user = updatedUser[0];
       return req.logout(user , (err) =>{
            if(err){console.error(err)}
        
        return res.status(200).json({success: true, message : "User Password Updated Successfully, Please login again"});
        }) ;
    }
     catch (err) {
        console.error(err);
        res.status(500).json({success : false, message: "Something went wrong"});
    }
    
};

export const updateProfile = async(req,res) =>{
    try {
        if(!req.body.email || !req.body.name){
            res.status(400).json({success: false, message: "Email OR the name feilds cannot be empty"});
        }
        if(req.body.email.trim().length === 0 || req.body.name.trim().length === 0 ){
            res.status(400).json({success: false, message: "Values of email and name cannot be empty"});
        }
       
        const updatedUser = await pool.query(profileUpdate, [req.body.name, req.body.email, req.user.id]);
        res.status(200).json({success: true, message: "User details updated successfully"});

    } catch (err) {
        console.error(err);
        res.status(500).json({success: false, message: "Something went wrong"});
    }
}