(function() {

    'use strict';

    var validator = require('../services/ValidatorService');
    var customError = require('../services/ErrorService');

    exports.validateHash = validateHash;
    exports.validateId = validateId;

    /**
     * For validating hash values that are used
     * for forms and launchpads. ex 54DjX  
     */
    function validateHash(req, res, next, hash) {
        if (!validator.isAlphanumeric(hash)) {
            throw new customError('Invalid parameters', 400);
        }
        next();
    }

    /**
     * For validating object ID's for searching
     * updating. ex 4456821
     */
    function validateId(req, res, next, id) {
        if (!validator.isInt(id)) {
            throw new customError('Invalid parameters', 400);
        }
        next();
    }

})();