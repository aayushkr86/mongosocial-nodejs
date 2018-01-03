(function () {

    'use strict';

    exports.errorCatchAll = errorCatchAll;
    //exports.errorNotFound = errorNotFound;

    /**
     * The main error handler. All errors in the
     * application funnel into this function,
     * which is pure awesomeness!!
     */
    function errorCatchAll(err, req, res, next) {
        res.status(err.status || 500);
        res.json({
            status: err.status,
            message: (err.message) ? err.message : err
        });
    }

    /**
     * If no route was hit, this will set
     * a general error of 404
     */
   /* function errorNotFound(req, res, next) {
        var err = new Error('Not Found');
        err.status = 404;
        next(err);
    }*/

})();