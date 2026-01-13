const saltedMd5 = require('salted-md5');


async function getMassMd5(password, salt){
    return saltedMd5(password, salt);
}

module.exports = {
    getMassMd5
}