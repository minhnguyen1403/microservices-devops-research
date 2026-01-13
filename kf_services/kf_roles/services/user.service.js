const { hashPassword, comparePassword } = require('../common/bcrypt');
const { } = require('../common/jwt')
const mongoose = require('mongoose');
const { KF_USERS } = require('../constants');
const { ObjectId } = mongoose.Types;
const createError = require('http-errors');
const _ = require('lodash');
const { sign } = require('../common/jwt')

async function handleLogin({ body, res }) {
    console.log(body)
    const user = await conn.query(`
        SELECT * 
        FROM ${KF_USERS} AS user
        WHERE user.username = "${body.username}"
    `);
    if (user.length == 0) throw createError(422, 'invalid_user', { msg: 'user is not existed' });
    const info = _.first(user);;
    const { password, username, full_name, id } = info
    if (!(await comparePassword(body.password, await hashPassword(body.password)))) {
        throw createError(422, 'invalid_pwd', { msg: 'password is not existed' })
    }
    const token = await sign(
        APP_CONFIG.jwt_secret,
        { id, full_name, username },
        "7d"
    );
    return { info, token }
        /** find user by username from db */
    // (
    //     user.password !== Helper.getPassMd5(password, APP_CONFIG.jwt.secret) &&
    //     !skip_check_password
    //   )
    
}

async function handleRegister({ body }) {
    const { password, username, full_name } = body;
    const hashPwd = await hashPassword(password);
    const record = await conn.query(`
        INSERT INTO ${KF_USERS} (username, password, full_name)
        VALUES (?, ?, ?)
    `, [username, hashPwd, full_name]);
    const insertedId = record.insertId;

    // Truy vấn để lấy lại bản ghi vừa chèn
    const rows = await conn.query(
        `SELECT * FROM ${KF_USERS} WHERE id = ?`,
        [insertedId]
    );

    return rows;
}

module.exports = {
    handleRegister,
    handleLogin,
    handleRegister,
}