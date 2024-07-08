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
const tracer = require('../internal/jaeger-handle/tracer');
const { FORMAT_HTTP_HEADERS } = require('opentracing');
const { getNamespace } = require('cls-hooked');
const { queryWithLogging } = require('../internal/models/cmd-mariadb');
const cacheProvider = require('../internal/redis/redis-client')

class UserController extends BaseController{
    static run(app) {
        app.post('/v1/users/login', validateBody(login), this.handler('login'));
        app.post('/v1/users/refreshtoken', validateBody(refreshtoken), this.handler('refreshtoken'));
        app.post('/v1/users/register', validateBody(register), this.handler('register'));
        app.get('/v1/users', this.handler('getList'));
        app.post('/v1/users/report-late', this.handler('handleReportLate'));
        app.get('/v1/users/lead-boarder', this.handler('getLeadBoarders'));
        app.get('/v1/users/tracing', this.handler('tracing'));

        
    }

    async tracing(req, res, next){
        try {
            console.log('test on ')
            const namespace = getNamespace('request');
            let headers = {}
            if (namespace) {
                const span = namespace.get('span');
                if (span)
                    tracer.inject(span.context(), FORMAT_HTTP_HEADERS, headers);
            }    
            const data = await axios.get('http://backend-kf_roles-1:3005/v1/roles', { headers })
            console.log(data.data)
            return res.json({})
        } catch (error) {
            next(error)
        }
    }

    async getLeadBoarders(req, res, next){
        try {
            const listUsers = await conn.query(`select * from ${KF_LEADBOARDERS} ORDER BY late_minute DESC`);
            return res.json(listUsers)
        } catch (error) {
            next(error)
        }
    }

    async handleReportLate(req, res, next){
        try {
            const {  name, late_minute } = req.body;
            const listUsers = await conn.query(`select * from ${KF_LEADBOARDERS} where name = "${name}"`);
            let minuteUpdate = late_minute;
            let countMinute = 1;
            if(listUsers.length > 0){
                console.log('remove')
                const report = _.first(listUsers);
                const { late_minute: old, late_count: oldCount } = report;
                minuteUpdate += old;
                countMinute += oldCount
                await conn.query(`Delete from ${KF_LEADBOARDERS} where name = "${name}" `)
            }
            const record = await conn.query(`
                INSERT INTO ${KF_LEADBOARDERS} (name, late_minute, late_count)
                VALUES (?, ?, ?)
            `, [name, minuteUpdate, countMinute]);
            const insertedId = record.insertId;

            // Truy vấn để lấy lại bản ghi vừa chèn
            const rows = await conn.query(
                `SELECT * FROM ${KF_LEADBOARDERS} WHERE id = ?`,
                [insertedId]
            );
            return res.json({rows})
        } catch (error) {
            next(error)
        }
    }

    async getList(req, res, next){
        try {
            logger.info('test get list')
            const namespace = getNamespace('request');
            //await redisClient.set('data', 'minh')
            const data = await cacheProvider.get('data');
            logger.info('data from cache: ', data)
            let headers = {}
            if (namespace) {
                const span = namespace.get('span');
                if (span)
                    tracer.inject(span.context(), FORMAT_HTTP_HEADERS, headers);
            }    
            //await axios.get('http://backend-kf_roles-1:3005/v1/roles', { headers })
            const listUsers = await queryWithLogging({query:`select * from ${KF_USERS}`, params:req.query}) 
            //conn.query(`select * from ${KF_USERS}`);
            return res.json(listUsers)
        } catch (error) {
            next(error)
        }
    }
    async login(req, res, next){
        try {
            const user = await userService.handleLogin({ body: req.body, res });
            return res.json(user)
        } catch (error) {
            next(error)
        }
    }

    async register(req, res, next){
        try {
            const body  = req.body;
            const data = await cacheProvider.get('data');
            logger.info('data from cache: ', data)
            const namespace = getNamespace('request');
            let headers = {}
            if (namespace) {
                const span = namespace.get('span');
                if (span)
                    tracer.inject(span.context(), FORMAT_HTTP_HEADERS, headers);
            }    
            console.log(`${APP_CONFIG.baseUrl}/v1/roles`);
            await axios.get(`http://kf_stack_nginx/v1/roles`, { headers })
            const user = await userService.handleRegister({ body });
            return res.status(201).json(user);
        } catch (error) {
            next(error)
        }
        // finally{
        //     if(conn) conn.release()
        // }
    }

    async refreshtoken(req, res, next){
        try {
            return res.json({msg: 'refreshtoken'})
        } catch (error) {
            next(error)
        }
    }
}


module.exports = UserController;
