const { generatePin } = require("./logics.js");
const { sendEmail } = require("./mailUser.js");
const client = require("./server.js");
const bcrypt = require("bcrypt");

async function getUser(name){
    const user = await client.db("GAS_BOOKING").collection("Users").findOne({$or : [{user_name : name},{gas_id : name},{mail : name}]});
    if(user){
        return user;
    }else{
        return null;
    }
}

async function pinValidation(mail,pin){
    const user = await client.db("GAS_BOOKING").collection("Users").findOne({mail : mail});
    if(user){
        if(user.pin == pin){
            await client.db("GAS_BOOKING").collection("Users").updateOne({mail : mail},{$set : {validation : "success"}});
            return "200/validationsuccessful"
        }else{
            return "418/invalidpin"
        }
    }else{
        return "404/invaliduser";
    }
}

async function passwordValidation(mail,password){
    const user = await getUser(mail);
    if(user){
        const passVerify = await bcrypt.compare(password,user.password);
        if(passVerify){
            return "200/pinSent"
        }else{
            return "418/invalidPassword"
        }
    }else{
        return "404/invaliduser";
    }
}

async function makeHashPassword(password){
    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password,salt);
    return hashed;
}

async function setPassword(mail,password){
    const pass = await makeHashPassword(password);
    const user = await getUser(mail);
    if(user){
        await client.db("GAS_BOOKING").collection("Users").updateOne({mail : mail},{
            $set : {
                password : pass
            }
        })
        return "200/success";
    }else{
        return "404/invaliduser";
    }
}

async function mailPin(mail){
    const user = await getUser(mail);
    if(user){
        const pin = generatePin();
        await sendEmail(mail,pin);
        await setPin(mail,pin);
        return "200/pinSent"
    }else{
        return "404/invaliduser";
    }
}

async function setPin(mail,pin){
    const user = await getUser(mail);
    if(user){
        await client.db("GAS_BOOKING").collection("Users").updateOne({mail : mail},{
            $set : {
                pin : pin
            }
        })
        return "200/success";
    }else{
        return "404/invaliduser";
    }
}


async function getProviders(){
    const providers = await client.db("GAS_BOOKING").collection("providers").aggregate([{
        $project : {_id : 0}
    }]).toArray();
    return providers ? providers[0] : null;
}

async function addHistory(gas_id, book){
    const user = await getUser(gas_id);
    if(user){
        await client.db("GAS_BOOKING").collection("Users").updateOne({gas_id : gas_id},{
            $push : {
                history : book
            }
        })
        return "200/success";
    }else{
        return "404/invaliduser";
    }
}

async function CancelBooked(mail,bookingNo){
    const user = await getUser(mail);
    if(user){
        await client.db("GAS_BOOKING").collection("Users").updateOne(
            {mail : mail},
            {$set : {
                "history.$[elem].status" : "Cancelled",
                "history.$[elem].payment_status" : "Refunded"
            }},
            {arrayFilters : [{"elem.booking_no" : bookingNo}]}
        )
        return "200/success";
    }else{
        return "404/invaliduser";
    }
}

module.exports = {CancelBooked,addHistory,setPassword,mailPin,
    getUser,pinValidation,getProviders,passwordValidation,setPin}