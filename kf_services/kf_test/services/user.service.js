const { hashPassword, comparePassword } = require('../common/bcrypt');
const { } = require('../common/jwt')
const mongoose = require('mongoose');
const { KF_USERS } = require('../constants');
const { ObjectId } = mongoose.Types;
const createError = require('http-errors');
const _ = require('lodash');
const { sign } = require('../common/jwt')
const tracer = require('../internal/jaeger-handle/tracer');
const { queryWithLogging } = require('../internal/models/cmd-mariadb')
const { userModel } = require('../models');


async function handleLogin({ body, res }) {
    console.log(body)
    // const user = await conn.query(`
    //     SELECT * 
    //     FROM ${KF_USERS} AS user
    //     WHERE user.username = "${body.username}"
    // `);
    const user = await userModel.findOne({username: body.username}).lean();
    if (!user) throw createError(422, 'invalid_user', { msg: 'user is not existed' });
    const { username, full_name, _id } = user
    if (!(await comparePassword(body.password, await hashPassword(body.password)))) {
        throw createError(422, 'invalid_pwd', { msg: 'password is not existed' })
    }
    const token = await sign(
        APP_CONFIG.jwt_secret,
        { _id, full_name, username },
        "7d"
    );
    return { user, token }
    
}

async function handleRegister({ body }) {
    const { password, username, full_name } = body;
    const hashPwd = await hashPassword(password);
    //const record = await queryWithLogging({query:`INSERT INTO ${KF_USERS} (username, password, full_name) VALUES (?, ?, ?)`, params: [username, hashPwd, full_name], body});
    const newData = await userModel.create({ username, password: hashPwd, full_name });
    
    // // Truy vấn để lấy lại bản ghi vừa chèn
    //const rows = await queryWithLogging({query:`SELECT * from ${KF_USERS} WHERE id = ?`, params: [insertedId] });

    return newData;
}

module.exports = {
    handleRegister,
    handleLogin,
    handleRegister,
}