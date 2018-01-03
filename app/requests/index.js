(function () {

    'use strict';

    var fs = require('fs');

    /**
     * Read all files in this file's directory
     * @type {object}
     */
    var files = fs.readdirSync(__dirname + '/');

    /**
     * Cycles through each file and exports it
     * as the file name. Example: User.js is exported as export.User
     */
    files.forEach(function (file) {
        if (file.match(/\.js$/) !== null && file !== 'index.js') {
            var name = file.replace('.js', '');
            exports[name] = require('./' + file);
        }
    });

})();