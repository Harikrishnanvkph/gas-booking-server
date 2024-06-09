const route = require("express").Router();
const { auth } = require("./auth");
const { getUser, pinValidation, getProviders, passwordValidation, setPin, mailPin, setPassword, addHistory, CancelBooked } = require("./dbOperations");
const client = require("./server");
const express = require("express");


route.get("/", async (req, res, next) => {
    res.send("Welcome to Hari Server");
  });


route.get("/tc",(req,res,next)=>{
  res.send("Here is Hari's Terms and Condition:\nWe will not share User Credentials to Third Parties and will only use to process internally for Better user Experience")
})

route.post("/getmail",express.json(),async(req,res,next)=>{
  const reg = req.body;
  const user = await getUser(reg.name);
  if(user != null){
    res.send(`200/${user.mail}`)
  }else{
    res.send(`404/`);
  }
})

route.post("/validate",express.json(),async(req,res,next)=>{
  const reg = req.body;
  const user = await pinValidation(reg.mail, reg.pin);
  res.send(user);
})

route.post("/providers",express.json(),async(req,res,next)=>{
  const prov = await getProviders();
  if(prov == null){
    res.send({status : "404/Cannot provide"})
  }
  res.send({
    status : "200/retrievedproviders",
    providers : prov
  })
})


route.post("/forgot",express.json(),async(req,res,next)=>{
  const reg = req.body;
  const status = await mailPin(reg.mail)
  res.send(status) ;
})

route.post("/passwordReset",express.json(),async(req,res,next)=>{
  const reg = req.body;
  const status = await setPassword(reg.mail,reg.password);
  res.send(status) ;
})

route.post("/getuser",express.json(),async(req,res,next)=>{
  const reg = req.body;
  const status = await getUser(reg.name);
  if(status){
    res.send(status);
  }else{
    res.send(null);
  }
})


route.post("/book",express.json(),async(req,res,next)=>{
  const reg = req.body;
  const status = await addHistory(reg.gas_id, reg.book);
  res.send(status);
})

route.post("/cancel", express.json(), auth, async (req, res, next) => {
  const reg = req.body;
  const status = await CancelBooked(reg.mail, reg.bookingNo);
  res.send(status);
});



module.exports = route;
