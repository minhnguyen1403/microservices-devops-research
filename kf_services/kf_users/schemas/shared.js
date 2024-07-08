exports.boolean = {
    type : 'boolean'
}

exports.stringCanEmpty = {
    type: 'string',
    minLength: 0,
};

exports.stringNotEmpty = {
    type: 'string',
    minLength: 1,
};

exports.mongoObjectId = {
    type: 'string',
    minLength: 24,
    maxLength: 24,
    pattern: '^[0-9a-fA-F]{24}$'
}

exports.numberPositive = {
    type: 'number',
    minimum: 0,
};

exports.integerPositive = {
    type: 'integer',
    minimum: 0,
};

exports.attributeHasName = {
    type: 'array',
    uniqueItems: true,
    items: {
        type: 'object',
        properties: {
            name: exports.stringNotEmpty,
        },
        required: ['name'],
    }
};

exports.attributeHasValue = {
    type: 'array',
    uniqueItems: true,
    items: {
        type: 'object',
        properties: {
            name: exports.stringNotEmpty,
            value: exports.stringNotEmpty,
        },
        required: ['name', 'value'],
    }
};

exports.metafields = {
    type: 'array',
    uniqueItems: true,
    items: {
        type: 'object',
        properties: {
            key: exports.stringNotEmpty,
            value: exports.stringNotEmpty,
        },
        required: ['key', 'value'],
    }
};

exports.arrayStrings = {
    type: 'array',
    uniqueItems: true,
    items: exports.stringNotEmpty
};

exports.numberPhone = {
    type: 'string',
    // maxLength: 11,
    // minLength: 9,
    // pattern: '(09|01[2|6|8|9])+([0-9]{8})'
};

exports.addresses = {
    type: 'object',
    properties: {
        address: exports.stringNotEmpty,
        province_code: exports.stringNotEmpty,
        district_code: exports.stringNotEmpty,
        ward_code: exports.stringNotEmpty,

        company: exports.stringNotEmpty,
        country: exports.stringNotEmpty,
        first_name: exports.stringNotEmpty,
        last_name: {
            type: 'string'
        },
        phone: exports.numberPhone,

        zip: exports.stringNotEmpty,
        default: exports.stringNotEmpty,

    },
    required: ['address', 'country', 'first_name'],
}

exports.addresses_empty = {
    type: 'object',
    properties: {
        address: exports.stringNotEmpty,
        province_code: exports.stringNotEmpty,
        district_code: exports.stringNotEmpty,
        ward_code: exports.stringNotEmpty,

        company: exports.stringNotEmpty,
        country: exports.stringNotEmpty,
        first_name: exports.stringNotEmpty,
        last_name: {
            type: 'string'
        },
        phone: exports.numberPhone,

        zip: exports.stringNotEmpty,
        default: exports.stringNotEmpty,

    },
    required: [],
}



exports.dateTime = {
    type: 'string',
    format: 'date-time'
  };