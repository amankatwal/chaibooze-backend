export const isAuthenticated = (req,res, next) =>{
    if(req.isAuthenticated()){
        next();
    }else{
        return res.status(401).json({success: false, message: "Please login to continue"})
    }
};

export const isAuthorized= (req,res,next) =>{
    const role = req.user.role;
    if (role === "Admin"){
        return next();
    }
    return res.status(401).json({success: false, message: `${req.user.name} is not authorized for this feature`})
}