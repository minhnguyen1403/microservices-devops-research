const shared = require('./shared');
const userConstant = require('../constants/user.constant');

const login = {
    type: 'object',
    properties: {
        username: {
            type: 'string',
        },
        password: {
            type: 'string',
        },
    },
    required: [
        'username',
        'password'
    ]
};

const refreshtoken = {
    type: 'object',
    properties: {
        jwt: {
            type: 'string'
        },
        refreshtoken: {
            type: 'string',
        },
    },
    required: [
        'jwt',
        'refreshtoken',
    ]
};

const register = {
    type: 'object',
    properties: {
        // employee_code: {
        //     type: 'string',
        //     minLength: 1,
        //     uppercase: true,
        //     db_unique: {
        //         collection: userConstant.KF_USERS,
        //         key: 'employee_code',
        //         conditions: { deleted: false }
        //     }
        // },
        username: {
            type: 'string',
            // db_unique: {
            //     collection: userConstant.KF_USERS,
            //     conditions: { deleted: false }
            // },
        },
        password: {
            type: 'string',
        },
        full_name: shared.stringNotEmpty,
        
    },
    required: [
        'username',
        'password',
        'full_name',
    ]
};

module.exports = {
    register,
    refreshtoken,
    login,
}