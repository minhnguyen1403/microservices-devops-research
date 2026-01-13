const bcrypt = require('bcrypt');


async function hashPassword(password) {
    try {
        const salt = await bcrypt.genSalt(APP_CONFIG.bcrypt_salt_round);
        const hash = await bcrypt.hash(password, salt);
        return hash;
    } catch (err) {
        throw err;
    }
}

// So sánh mật khẩu
async function comparePassword(plainPassword, hash) {
    try {
        const match = await bcrypt.compare(plainPassword, hash);
        return match;
    } catch (err) {
        throw err;
    }
}

module.exports = {
    hashPassword, 
    comparePassword,
}
