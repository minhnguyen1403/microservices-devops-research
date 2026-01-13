const {
    validateBody,
} = require('../middlewares/validator/validator')
const {
    login, refreshtoken, register,
} = require('../schemas/user.schema');
const BaseController = require('./base.controller');
const userService = require('../services/user.service');
const { KF_USERS, KF_LEADBOARDERS } = require('../constants')
const _ = require('lodash')
const axios = require('axios')
class RoleController extends BaseController{
    static run(app) {
        app.get('/v1/roles', this.handler('getRoles'));
        
    }
    async getRoles(req, res, next){
        try{
            return res.json({ msg: 'true'})
        }catch(err){
            next(err)
        }
    }
}


module.exports = RoleController;
