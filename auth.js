const jwt = require("jsonwebtoken");

//custom middleware to validate token
const auth = (req,res,next)=>{
    const token = req.cookies.token;
    if(!token){
        return res.send("404/NoValidation")
    }

    jwt.verify(token,process.env.SECRET_KEY,(err,user)=>{
        if(err){
            return res.send("418/InvalidToken")
        }
        console.log("In here Token Validation");
        req.user = user;
        next();
    })
}

module.exports = {auth};