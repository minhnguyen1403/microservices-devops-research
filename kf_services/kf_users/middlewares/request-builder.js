const URL = require('url').URL;
const Path = require('path');
const fs = require('fs');
const NODE_ENV = process.env.NODE_ENV;
const {
    ACCESS_TRUSTED_HEADER
} = require('../constants');

/**
 * Http request builder
 * this object will contruct request object
 */
class RequestBuilder {

    static init(baseUrl) {
        return new RequestBuilder(baseUrl);
    }
    /**
   * Http request builder
   * this object will contruct request object
   *
   * Constructor function
   *
   * @param {string} baseUrl request host name  
   */
    constructor(baseUrl) {
        let _baseUrl = baseUrl;
        if (!_baseUrl) {
            if (process.env.KFM_BASE_URL) {
                _baseUrl = process.env.KFM_BASE_URL;
            } else if (NODE_ENV === 'production') {
                _baseUrl = 'https://api.kingfood.co';
            } else if (
                NODE_ENV === 'development' ||
                NODE_ENV === 'localhost' ||
                NODE_ENV === 'test'
            ) {
                _baseUrl = 'https://api-dev.kingfoodmart.net';
            }
        }

        if (!_baseUrl) throw new Error('error_invalid_base_url');

        this.baseUrl = _baseUrl;
        this.json = true;
        this.path = '';
        this.version = '';
        this.headers = {
            'kdb-request-source': process.env.APP_NAME
        };
        this.qs = {};
        this.body = {};
        this.form = {};
        this.formData = {};
        return this;
    }

    /**
     * Make a GET request
     *
     * @param {Object} qs request' query string
     */
    makeGET(qs = null) {
        this.method = 'GET';
        if (qs) {
            return this.withQueryString(qs);
        }

        return this;
    };


    /**
     * Make POST request
     *
     * @param {Object} body request's body
     */
    makePOST(body = null) {
        this.method = 'POST';
        if (body) {
            return this.withBody(body);
        }
        return this;
    };


    /**
     * Make PUT request
     *
     * @param {Object} body request's body
     */
    makePUT(body = null) {
        this.method = 'PUT';
        if (body) {
            return this.withBody(body);
        }
        return this;
    };

    /**
     * Make PATCH request
     *
     * @param {Object} body request's body
     */
    makePATCH(body = null) {
        this.method = 'PATCH';
        if (body) {
            return this.withBody(body);
        }
        return this;
    };

    /**
     * Make DELETE request
     *
     * @param {Object} body request's body
     */
    makeDELETE(body = null) {
        this.method = 'DELETE';
        if (body) {
            return this.withBody(body);
        }
        return this;
    };


    withFullResponse() {
        this.resolveWithFullResponse = true;
        this.simple = false;
        return this;
    };


    simpleResponse() {
        this.resolveWithFullResponse = false;
        this.simple = true;
        return this;
    };


    /**
     * This version will add to request's pathname
     * when build function called
     *
     * @param {string} version api version
     */
    withVersion(version) {
        this.version = version;
        return this;
    };


    /**
     * This function can be call multiple time
     * to append path to full path
     *
     * @param {string} path path
     */
    withPath(path) {
        let newPath = Path.join(this.path, path);
        newPath = Path.normalize(newPath);
        this.path = newPath;
        return this;
    };

    withFormData(key, value) {
        const formData = {};
        formData[key] = JSON.stringify(value);
        this.formData = Object.assign(this.formData, formData);
        return this;
    };


    withForm(form) {
        this.form = Object.assign(this.form, form);
        return this;
    };


    withBody(body) {
        this.body = Object.assign(this.body, body);
        return this;
    };


    withQueryString(qs) {
        this.qs = Object.assign(this.qs, qs);
        return this;
    };


    willTimeoutIn(timeout) {
        this.timeout = timeout;
        return this;
    };


    withFileUpload(keyName, path, filename, contentType = null) {
        this.formData[keyName] = {
            value: fs.createReadStream(path),
            options: {
                filename: filename,
                contentType: contentType,
            }
        };
        return this;
    };


    /**
     * Use this function to add custom header
     *
     * @param {Object} headers request's header
     */
    withHeaders(headers) {
        this.headers = Object.assign(this.headers, headers);
        return this;
    };

    /**
     * Setup access trusted header
     * @param {string} key Access trusted key
     */
    trusted(publicKey) {
        const headers = {};
        headers[`${ACCESS_TRUSTED_HEADER}`] = publicKey;
        return this.withHeaders(headers);
    };

    retry(limit = 1, backoff = 60000) {
        return this.withQueryString({
            retry_enable: 1,
            retry_limit: limit,
            retry_backoff: backoff
        });
    }

    /**
     * This function will return full request object
     * from multiple part of this class
     */
    build() {
        if (!this.method) {
            throw new Error('error_invalid_method');
        }

        const url = new URL(this.baseUrl);


        let pathname = Path.join(this.version, this.path);
        pathname = Path.normalize(pathname);
        url.pathname = pathname;

        const options = {
            uri: url.href,
            method: this.method,
            json: this.json,
        };

        if (this.headers) {
            options.headers = this.headers;
        }

        if (Object.keys(this.body).length !== 0) {
            options.body = this.body;
        }

        if (Object.keys(this.qs).length !== 0) {
            options.qs = this.qs;
        }

        if (Object.keys(this.form).length !== 0) {
            options.json = false;
            options.form = this.form;
        }

        if (Object.keys(this.formData).length !== 0) {
            options.json = false;
            options.formData = this.formData;
        }

        if (this.resolveWithFullResponse !== undefined && this.resolveWithFullResponse !== null) {
            options.resolveWithFullResponse = this.resolveWithFullResponse;
            options.simple = this.simple;
        }

        if (this.timeout) {
            options.timeout = this.timeout;
        }

        return options;
    };
}

exports.RequestBuilder = RequestBuilder;


