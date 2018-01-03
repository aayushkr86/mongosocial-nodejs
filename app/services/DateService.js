var moment = require('moment');

var format = {
    // Setting to a custom format will convert it from UTC, all backend times should be utc
    // call .format("YYYY-MM-DD HH:mm:ss") instead
    //
    // full: 'YYYY-MM-DD HH:mm:ss Z',
    // simple: 'MM/DD/YYYY'
    x: 'x',
    dateTime: 'YYYY-MM-DD HH:mm:ss'
};

module.exports = {
    formatX: function(date) {
        return moment.utc(date).format(format.x);
    },

    formatDateTime: function(date) {
        return moment.utc(date).format(format.dateTime);
    },

    formatReadAble: function(date) {
        return moment.utc(date).format();
    },

    unixFormat: function(date) {
        return moment.utc(date).unix();
    },

    utcFormat: function(date) {
        return moment.utc(date).format();
    },

    unixSimpleFormat: function(date) {
        return moment.unix(date).utc().format();
    },

    dateToUnix: function(date) {
        return moment(date, format.simple).unix();
    },

    now: function() {
        return moment.utc().format();
    },

    nowUnix: function() {
        return moment().unix();
    },

    nowUnixMilli: function() {
        return moment.utc().format(format.x);
    },

    addDays: function(days) {
        return moment.utc().add(days, 'days').format();
    },

    subtractMinutes: function(minutes) {
        return moment.utc().subtract(minutes, 'minutes').format();
    },

    addMinutes: function(minutes) {
        return moment().utc().add(minutes, 'minutes').format();
    },

    subtractMinutesToDate: function(minutes) {
        return moment.utc().subtract(minutes, 'minutes').toDate();
    },

    subtractMonthUnix: function(months) {
        return moment.utc().subtract(months, 'months').unix();
    },

    subtractMonths: function(date, months) {
        return moment.utc(date).subtract(months, 'months').format();
    },

    addMonths: function(date, months) {
        return moment.utc(date).add(months, 'months').format();
    },

    endOfMonth: function(date) {
        return moment.utc(date).endOf('month');
    }


};