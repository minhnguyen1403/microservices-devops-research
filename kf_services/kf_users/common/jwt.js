const util = require('util');
const jwt = require('jsonwebtoken');
const signJwt = util.promisify(jwt.sign);
const verifyJwt = util.promisify(jwt.verify);

/**
 * Create jwt token
 *
 * @param {string} secret secret or private key
 * @param {object} user payload
 * @param {*} expiredIn
 */
async function sign(secret, user, expiresIn) {
    const payload = {
        user: user,
    };

    const options = {
        expiresIn: expiresIn
    };

    return signJwt(payload, secret, options);
}
exports.sign = sign;


/**
 * Verify jwt token
 *
 * @param {string} secret secret or private key
 * @param {string} token jwt-token
 */
async function verify(secret, token) {
    return verifyJwt(token, secret).then(decoded => {
        return decoded;
    });
}
exports.verify = verify;
