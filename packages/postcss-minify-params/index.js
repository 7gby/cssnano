var postcss = require('postcss');
var parser = require('postcss-value-parser');
var stringify = parser.stringify;
var trim = parser.trim;
var natural = require('javascript-natural-sort');
var uniqs = require('uniqs');

function split(nodes, div) {
    var i, max, node;
    var result = [];
    var last = '';

    for (i = 0, max = nodes.length; i < max; i += 1) {
        node = nodes[i];
        if (node.type === 'div' && node.value === div) {
            result.push(last);
            last = '';
        } else {
            last += stringify(node);
        }
    }

    result.push(last);

    return result;
}

module.exports = postcss.plugin('postcss-minify-params', function () {
    return function (css) {
        css.walkAtRules(function (rule) {
            if (!rule.params) {
                return;
            }

            var params = parser(rule.params);

            params.walk(function (node) {
                if (node.type === 'div') {
                    node.before = '';
                    node.after = '';
                }

                if (node.type === 'space') {
                    node.value = ' ';
                }

                if (node.type === 'function') {
                    trim(node.nodes);
                }
            }, true);

            rule.params = uniqs(split(params.nodes, ',')).sort(natural).join();
        });
    };
});