const Joi = require('joi');

const validate = (schema, source = 'body') => (req, res, next) => {
    const { value, error } = Joi.compile(schema)
        .prefs({ errors: { label: 'key' }, abortEarly: false })
        .validate(req[source]);

    if (error) {
        const errorMessage = error.details.map((details) => details.message).join(', ');
        return res.status(400).json({ message: errorMessage });
    }
    
    // Replace the request source with the validated/sanitized value
    // This prevents NoSQL injection by ensuring only defined fields are passed
    req[source] = value;
    return next();
};

module.exports = validate;
