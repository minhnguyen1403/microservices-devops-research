const Ajv = require('ajv');
const createError = require('http-errors');
const ajv = new Ajv();
function generateErrorMessage(error) {
    switch (error.keyword) {
        case "required":
            return `error_${error.params.missingProperty}_is_required`;

        case "db_exists": {
            const paths = error.dataPath.split('/');
            const field = paths.splice(-1);
            return `error_${field}_notfound`;
        }


        case "db_unique": {
            const paths = error.dataPath.split('/');
            const field = paths.splice(-1);
            return `error_${field}_existed`;
        }

        default: {
            if (error.dataPath) {
                const paths = error.dataPath.split('/');
                if (paths.length > 0) {
                    const field = paths.splice(-1);
                    return `error_${field}_invalid`;
                }
            }

            return error.message;
        }
    }
}
function validateSchema(schema, path = 'body') {
    schema["$async"] = true;
    return async function (req, res, next) {
        try {
            await ajv.validate(schema, req[path]);
            next();

        } catch (err) {
            if (!(err instanceof Ajv.ValidationError)) {
                return next(createError.InternalServerError(err.message))
            };

            const msgs = err.errors.map(generateErrorMessage);
            next(createError.UnprocessableEntity(msgs));
        }
    }
};

function validateBody(schema) {
    return validateSchema(schema, 'body');
}

module.exports = {
    validateSchema,
    validateBody,
}