const Handlebars = require('handlebars');

// Định nghĩa hàm giúp
Handlebars.registerHelper('isLessThan', function (value1, value2, options) {
    return value1 <= value2 ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('isLessThanRemake', function (value1, value2, options) {
    return value1 < value2 ? options.fn(this) : options.inverse(this);
});


Handlebars.registerHelper('subtract', function (value1, value2) {
    return value1 - value2;
});

Handlebars.registerHelper('mul', function (value1, value2) {
    return value1 * value2;
});

Handlebars.registerHelper('add', function (value1, value2) {
    return value1 + value2;
});

