const createError = require('http-errors');
const tracer = require('../internal/jaeger-handle/tracer');
const RequestBuilder = require('../middlewares/request-builder').RequestBuilder;
/**
 * All service's controller must be extended from this
 * controller.
 */
class BaseController {
    static middlewares(fn) {
        return [];
    };
    static handler(fn) {
        const middlewares = this.middlewares(fn);
        return [
            //authorized(APP_CONFIG.jwt),
            middlewares,
            (req, res, next) => {
                const controller = new this(req, res, next);
                if (controller[fn].constructor.name === 'AsyncFunction') {
                    controller[fn](req, res, next).catch(next);
                } else {
                    controller[fn](req, res, next);
                }
            }
        ];
    };

    createTracingHeader() {
        const tracingHeaders = {};
        tracer.inject(this.span.context(), FORMAT_HTTP_HEADERS, tracingHeaders);
        return tracingHeaders;
    }

    // Create request builder instance
    reqBuilder = () => {
        return new RequestBuilder().withHeaders(this.createTracingHeader());
    };

    trustedReqBuilder(key) {
        const headers = {};
        headers[ACCESS_TRUSTED_HEADER] = key;
        return this.reqBuilder().withHeaders(headers);
    }
    /**
     * Children controller must implement
     * this method to routing request.
     *
     * @param {Object} app Express server instance
     */
    static run(app) { };
}

module.exports = BaseController;
