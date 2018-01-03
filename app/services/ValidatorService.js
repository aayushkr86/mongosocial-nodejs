(function() {

    'use strict';

    var validator = require('validator');

    /**
     *
     * Extends the NPM Validator module
     * with custom validation
     *
     */
    validator.isE164PhoneNumber = isE164PhoneNumber;
    validator.isAlphanumericDash = isAlphanumericDash;
    validator.isImage = isImage;
    validator.isFaceBookProfileURL = isFaceBookProfileURL;
    validator.isYelpProfileURL = isYelpProfileURL;
    validator.isTripAdvisorProfileURL = isTripAdvisorProfileURL;
    validator.isHealthGradesProfileURL = isHealthGradesProfileURL;
    validator.isSuperPagesProfileURL = isSuperPagesProfileURL;
    validator.isYellowPagesProfileURL = isYellowPagesProfileURL;
    validator.isCitySearchProfileURL = isCitySearchProfileURL;
    validator.isMerchantCircleProfileURL = isMerchantCircleProfileURL;
    validator.isAngiesListProfileURL = isAngiesListProfileURL;
    validator.convertValueToString = convertValueToString;

    module.exports = validator;

    /**
     * Validate a phone number based on the international e164 format
     */
    function isE164PhoneNumber(string) {
        return /^\+?\d{10,15}$/.test(string);
    }

    /**
     * Validate alpha numeric dash and underscore
     */
    function isAlphanumericDash(string) {
        return /^[a-zA-Z0-9-_]+$/.test(string);
    }

    /**
     * Validates a mime string to ensure it has an image type
     */
    function isImage(mime) {
        var imageTypes = ['jpeg', 'png', 'gif', 'bmp', 'svg'];
        var isImage = false;

        imageTypes.forEach(function(element, index) {
            if (validator.contains(mime, element)) {
                isImage = true;
            }
        });

        // no match
        return isImage;
    }

    /**
     * Validates Facebook Profile URL's
     */
    function isFaceBookProfileURL(string) {
        return /^(https?:\/\/)?(www\.)?facebook.com\/[-a-zA-Z0-9(\.\?)?]+$/.test(string);
    }

    /**
     * Validates Yelp Profile URL's
     */
    function isYelpProfileURL(string) {
        return /^(https?:\/\/)?(www\.)?yelp.com\/biz\/[-a-zA-Z0-9(\.\?)?]+$/.test(string);
    }

    /**
     * Validates TripAdvisor Profile URL's
     */
    function isTripAdvisorProfileURL(string) {
        return /^(https?:\/\/)?(www\.)?tripadvisor.com\/.+(\.html)$/.test(string);
    }

    /**
     * Validates HealthGrades Profile URL's
     */
    function isHealthGradesProfileURL(string) {
        return /^(https?:\/\/)?(www\.)?healthgrades.com\/.+$/.test(string);
    }

    /**
     * Validates SuperPages Profile URL's
     */
    function isSuperPagesProfileURL(string) {
        return /^(https?:\/\/)?(www\.)?superpages.com\/.+$/.test(string);
    }

    /**
     * Validates YellowPages Profile URL's
     */
    function isYellowPagesProfileURL(string) {
        return /^(https?:\/\/)?(www\.)?yellowpages.com\/.+$/.test(string);
    }

    /**
     * Validates CitySearch Profile URL's
     */
    function isCitySearchProfileURL(string) {
        return /^(https?:\/\/)?(www\.)?citysearch.com\/profile\/.+$/.test(string);
    }

    /**
     * Validates MerchantCircle Profile URL's
     */
    function isMerchantCircleProfileURL(string) {
        return /^(https?:\/\/)?(www\.)?merchantcircle.com\/.+$/.test(string);
    }

    /**
     * Validates AngiesList Profile URL's
     */
    function isAngiesListProfileURL(string) {
        return /^(https?:\/\/)?(www\.)?member.angieslist.com\/member\/store\/[0-9]+\/?.+$/.test(string);
    }

    /**
     * The NPM Validator module only accepts strings
     * so we need a way to convert all types to string
     * values
     * @param  {mixed}
     * @return {string}
     */
    function convertValueToString($value) {
        return $value + '';
    }

})();
