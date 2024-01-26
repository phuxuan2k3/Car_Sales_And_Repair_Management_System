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

Handlebars.registerHelper('addInt', function (value1, value2) {
    return parseInt(value1) + parseInt(value2);
});

Handlebars.registerHelper("when", function (operand_1, operator, operand_2, options) {
    var operators = {
        'eq': function (l, r) { return l == r; },
        'noteq': function (l, r) { return l != r; },
        'gt': function (l, r) { return Number(l) > Number(r); },
        'or': function (l, r) { return l || r; },
        'and': function (l, r) { return l && r; },
        '%': function (l, r) { return (l % r) === 0; }
    }
        , result = operators[operator](operand_1, operand_2);

    if (result) return options.fn(this);
    else return options.inverse(this);
});

Handlebars.registerHelper("orCompare", function (operand_1, operand_2, operand_3, options) {
    if (operand_1 == operand_2 || operand_1 == operand_3) return options.fn(this);
    else return options.inverse(this);
});