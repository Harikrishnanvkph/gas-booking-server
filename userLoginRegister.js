const userRouter = require("express").Router();
const express = require("express")
const client = require("./server.js");
const bcrypt = require("bcrypt");
const { sendEmail } = require("./mailUser.js");
const jwt = require("jsonwebtoken");
const { auth } = require("./auth.js");
const { getProviders } = require("./dbOperations.js");
const { generatePin } = require("./logics.js");


userRouter.post("/register",express.json(),async (req,res,next)=>{
    const pin = generatePin();
    try{
        const reg = req.body;
        const user = await client.db("GAS_BOOKING").collection("Users").findOne({$or : [{user_name : reg.user_name},{mail : reg.mail}]});
        if(!user){
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(reg.password,salt);
            const possibleUserId = await client.db("GAS_BOOKING").collection("siteVariables").findOne({},{user_id : 1, _id : 0});
            await client.db("GAS_BOOKING").collection("Users").insertOne({
                gas_id : possibleUserId.user_id,
                mail : reg.mail,
                user_name : reg.user_name,
                password : hashedPassword,
                validation : "pending",
                pin : pin,
                history : []
            });
            const ps = (parseInt(possibleUserId.user_id) + 1).toString();
            await client.db("GAS_BOOKING").collection("siteVariables").updateOne({},{
                $set : {
                    user_id : ps
                }
            })
            await sendEmail(reg.mail,pin);
            res.send(true)
        }else{
            res.send(false)
        }
    }catch(error){
        console.log(error)
    }
})

userRouter.post("/login",express.json(),async (req,res,next)=>{
    const reg = req.body;
    const user = await client.db("GAS_BOOKING").collection("Users").findOne({$or : [{user_name : reg.login_name},{gas_id : reg.login_name},{mail : reg.login_name}]});
    if(user){
        const flag = await bcrypt.compare(reg.password,user.password);
        if(flag){
            if(user.validation == "pending"){
                res.send(`418/pendingvalidation/${user.mail}`);
            }else{
                //token generation
                const token = jwt.sign({
                    id : user._id,
                    exp: Math.floor(Date.now() / 1000) + (60)
                },process.env.SECRET_KEY);
                res.cookie("token",token,{ httpOnly: true, secure: false, sameSite: 'None' });
                res.send(`200/success/${user.mail}`);
            }
        }else{
            res.send(`404/success/${user.mail}`);
        }
    
    }else{
        res.send(`404/failed/NoUser`)
    }
})




module.exports = userRouter;