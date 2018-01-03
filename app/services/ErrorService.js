(function() {

    'use strict';

    var util = require('util');

    /**
     * Extend the base Error class with our
     * custom error classe
     */
    module.exports = function CustomError(message, status) {
        Error.captureStackTrace(this, this.constructor);
        this.name = this.constructor.name;
        this.message = message;
        this.status = status;
    };

    util.inherits(module.exports, Error);

})();