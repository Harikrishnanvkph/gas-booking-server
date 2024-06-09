

function generatePin(){
    return Math.ceil(Math.random(10000)*9000+1000);
}


module.exports = {generatePin}