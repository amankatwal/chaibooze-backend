import passport from "passport";
import { Strategy } from "passport-local";
import bcrypt from "bcrypt";
import { pool } from "../db.js";
import { userLogin } from "../queries/query.js";

passport.use(new Strategy({ usernameField: "email", passwordField: "password" }, async function verify(email, password, cb) {
    try {
        const result = await pool.query(userLogin, [email]);
     if (result.length > 0){
        const user = result[0]
        const hashedPassword = user.password;
        const isMatch = await bcrypt.compare(password, hashedPassword);
        if (!isMatch) {
             return  cb({message : "Email or password is incorrect"});
        } else {
          return  cb(null, user);
        }
     }else{
            return cb({ message: "Email or password is incorrect"})
     }
        
    } catch (err) {
 return  cb (err);
    }

}));

    passport.serializeUser((user,cb) =>{
cb(null, user)
});
passport.deserializeUser((user, cb) =>{
cb(null,user)
});

export default passport;