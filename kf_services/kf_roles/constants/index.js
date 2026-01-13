const userConstant = require('./user.constant');
const dbConstants = require('./db.constant');
module.exports = {
    userConstant,
    ...dbConstants,
}