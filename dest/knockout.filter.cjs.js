'use strict';

// construct array from an array like object
//
// @param {ArrayLike} target
// @param {Number} start start index
// @param {Number} end end index
// @return {Array}
function toArray(target, start, end) {
    var len = target.length;
    var result = [];

    start = start || 0;
    end = end === undefined ? len : end < 0 ? len + end : end;

    var i = end - start;

    while (i > 0) {
        i = i - 1;
        result[i] = target[i + start];
    }

    return result;
}

// throw error
//
// @param {String} message
function throwError(message) {
    throw new Error("knockout.filter: " + message);
}

var CHAR_SINGLE = 0x27; // '
var CHAR_DOUBLE = 0x22; // "
var CHAR_LEFT_CURLY = 0x7b; // {
var CHAR_RIGHT_CURLY = 0x7d; // }
var CHAR_LEFT_SQUARE = 0x5b; // [
var CHAR_RIGHT_SQUARE = 0x5d; // ]
var CHAR_LEFT_PAREN = 0x28; // (
var CHAR_RIGHT_PAREN = 0x29; // )
var CHAR_SLASH = 0x5c; // \
var CHAR_COMMA = 0x2c; // ,
var CHAR_COLON = 0x3a; // :
var CHAR_Q_MARK = 0x3f; // ?
var CHAR_PIPE = 0x7c; // |

/*
 * examples:
 *
 * hello | uppercase
 * hello | uppercase | wrap '(' ')'
 * function () { return hello } | uppercase
 * function () { return 'hello' } | uppercase
 */

var filterTokenRe = /[^\s'"]+|'[^']*'|"[^"]*"/g;
var inSingle = void 0;
var inDouble = void 0;
var curly = void 0;
var square = void 0;
var paren = void 0;
var str = void 0;
var exp = void 0;
var i = void 0;
var len = void 0;
var lastFilterIndex = void 0;
var prev = void 0;
var c = void 0;
var filters = null;

function pushFilter() {
    var currentExp = str.slice(lastFilterIndex, i).trim();

    if (currentExp) {
        var tokens = null;
        var filter = null;

        tokens = currentExp.match(filterTokenRe);
        filter = {
            name: tokens[0]
        };

        if (tokens.length > 1) {
            filter.args = toArray(tokens, 1);
        }

        filters = filters || [];
        filters.push(filter);
    }
}

function reset() {
    exp = str = '';
    filters = null;
    inSingle = inDouble = false;
    lastFilterIndex = curly = square = paren = 0;
}

function parse(s) {
    reset();
    str = s;

    for (i = 0, len = s.length; i < len; i += 1) {
        prev = c;
        c = str.charCodeAt(i);

        if (inSingle) {
            if (c === CHAR_SINGLE && prev !== CHAR_SLASH) {
                inSingle = !inSingle;
            }
        } else if (inDouble) {
            if (c === CHAR_DOUBLE && prev !== CHAR_SLASH) {
                inDouble = !inDouble;
            }
        } else if (c === CHAR_SINGLE) {
            inSingle = true;
        } else if (c === CHAR_DOUBLE) {
            inDouble = true;
        } else if (c === CHAR_PIPE && prev !== CHAR_PIPE && str[i + 1].charCodeAt(0) !== CHAR_PIPE) {
            if (!exp) {
                exp = str.substr(0, i).trim();
            } else if (lastFilterIndex !== 0) {
                pushFilter();
            }

            lastFilterIndex = i + 1;
        } else {
            switch (c) {
                case CHAR_LEFT_PAREN:
                    paren += 1;
                    break;
                case CHAR_RIGHT_PAREN:
                    paren -= 1;
                    break;
                case CHAR_LEFT_SQUARE:
                    square += 1;
                    break;
                case CHAR_RIGHT_SQUARE:
                    square -= 1;
                    break;
                case CHAR_LEFT_CURLY:
                    curly += 1;
                    break;
                case CHAR_RIGHT_CURLY:
                    curly -= 1;
                    break;
            }
        }
    }

    if (!exp) {
        exp = str.slice(0, i).trim();
    } else if (lastFilterIndex !== 0) {
        pushFilter();
    }

    if (paren !== 0 || curly !== 0 || square !== 0) {
        throwError('Syntax Error');
    }

    return {
        exp: exp,
        filters: filters
    };
}

var filterParser = {
    parse: parse
};

/**
 * AST tree node constructor
 *
 * new Node('key', 'value')
 */

function Node() {
    var key = arguments.length <= 0 || arguments[0] === undefined ? '' : arguments[0];
    var value = arguments.length <= 1 || arguments[1] === undefined ? '' : arguments[1];

    this.key = key.trim();
    this.value = value.trim();
    this.children = this.parent = this.root = null;
}

Node.prototype.add = function add(node) {
    this.children = this.children || [];
    this.children.push(node);
    node.parent = this;
};

Node.prototype.toString = function toString() {
    var key = this.key;
    var value = this.value;
    var children = this.children;
    var childrenString = '';

    if (key && value) {
        return key + ': ' + value;
    } else if (this.children) {
        childrenString = children.map(function (node) {
            return node.toString();
        }).join(', ');

        return key ? key + ': { ' + childrenString + ' }' : childrenString;
    } else {
        return '';
    }
};

/*
 * examples:
 *
 * foo: bar, foo2: bar2
 * foo: bar, foo2: { foo3: bar3 }
 */

var spaceRe = /\s/;
var inSingle$1 = void 0;
var inDouble$1 = void 0;
var inTernary = void 0;
var inChildContext = void 0;
var curly$1 = void 0;
var square$1 = void 0;
var paren$1 = void 0;
var str$1 = void 0;
var contextKey = void 0;
var contextValue = void 0;
var i$1 = void 0;
var len$1 = void 0;
var lastIndex = void 0;
var prev$1 = void 0;
var next = void 0;
var c$1 = void 0;
var rootNode = void 0;
var contextNode = void 0;

function pushNode() {
    var node = new Node(contextKey, contextValue);

    node.root = rootNode;
    contextNode.add(node);
    contextKey = contextValue = '';
    lastIndex = i$1 + 1;

    return node;
}

function reset$1() {
    rootNode = new Node();
    contextNode = rootNode;
    inSingle$1 = inDouble$1 = inTernary = inChildContext = false;
    prev$1 = next = null;
    lastIndex = curly$1 = square$1 = paren$1 = 0;
    contextKey = contextValue = str$1 = '';
}

function peekBackFirstNoSpaceLetter() {
    var j = i$1 - 1;

    while (j && spaceRe.test(str$1[j])) {
        j--;
    }

    return j > -1 ? str$1[j].charCodeAt(0) : 0;
}

function parse$1(s) {
    reset$1();
    str$1 = s;

    for (i$1 = 0, len$1 = s.length; i$1 < len$1; i$1 += 1) {
        prev$1 = c$1;
        c$1 = str$1.charCodeAt(i$1);

        if (inSingle$1) {
            if (c$1 === CHAR_SINGLE && prev$1 !== CHAR_SLASH) {
                inSingle$1 = !inSingle$1;
            }
        } else if (inDouble$1) {
            if (c$1 === CHAR_DOUBLE && prev$1 !== CHAR_SLASH) {
                inDouble$1 = !inDouble$1;
            }
        } else if (c$1 === CHAR_SINGLE) {
            inSingle$1 = true;
        } else if (c$1 === CHAR_DOUBLE) {
            inDouble$1 = true;
        } else if (c$1 === CHAR_Q_MARK) {
            next = s[i$1 + 1].charCodeAt(0);
            inTernary = true;
        } else if (c$1 === CHAR_COLON) {
            if (inTernary) {
                inTernary = false;
            } else {
                contextKey = str$1.slice(lastIndex, i$1);
                lastIndex = i$1 + 1;
            }
        } else if (c$1 === CHAR_COMMA && paren$1 === 0) {
            if (contextKey) {
                contextValue = str$1.slice(lastIndex, i$1);
                pushNode();
            } else {
                lastIndex = i$1 + 1;
            }
        } else if (c$1 === CHAR_LEFT_CURLY && contextKey && peekBackFirstNoSpaceLetter() === CHAR_COLON) {
            inChildContext = !inChildContext;
            contextNode = pushNode();
        } else if (c$1 === CHAR_RIGHT_CURLY && contextKey && inChildContext) {
            inChildContext = !inChildContext;
            contextValue = str$1.slice(lastIndex, i$1);
            pushNode();
            contextNode = contextNode.parent;
        } else {
            switch (c$1) {
                case CHAR_LEFT_PAREN:
                    paren$1 += 1;
                    break;
                case CHAR_RIGHT_PAREN:
                    paren$1 -= 1;
                    break;
                case CHAR_LEFT_SQUARE:
                    square$1 += 1;
                    break;
                case CHAR_RIGHT_SQUARE:
                    square$1 -= 1;
                    break;
                case CHAR_LEFT_CURLY:
                    curly$1 += 1;
                    break;
                case CHAR_RIGHT_CURLY:
                    curly$1 -= 1;
                    break;
            }
        }
    }

    if (contextKey && lastIndex !== 0) {
        contextValue = str$1.slice(lastIndex);
        pushNode();
    }

    if (paren$1 !== 0 || curly$1 !== 0 || square$1 !== 0) {
        throwError('Syntax Error');
    }

    return rootNode;
}

function stringify(ast) {
    return ast.toString();
}

var bindingParser = {
    parse: parse$1,
    stringify: stringify
};

/**
 * override original knockout binding provider
 *
 * bindingProvider.instance.preprocessNode
 * bindingProvider.instance.getBindingsString
 */

var original = ko.bindingProvider.instance.getBindingsString;

function wrapFilterArg(arg) {
    return 'ko.unwrap(' + arg + ')';
}

function processBindingValue(bindingValue, bindingContext) {
    var result = filterParser.parse(bindingValue);
    var filter = null;
    var filterName = '';
    var filterArgsString = '';
    var filterArgs = null;

    if (result.filters) {
        while (filter = result.filters.shift()) {
            filterName = filter.name;
            filterArgs = filter.args;
            filterArgsString = wrapFilterArg(result.exp);

            if (filterArgs) {
                filterArgs.unshift(filterArgsString);
                filterArgsString = filterArgs.map(wrapFilterArg).join(', ');
            }

            if (ko.filters[filterName]) {
                result.exp = 'ko.filters.' + filterName + '(' + filterArgsString + ')';
            } else {
                throw new Error('Filter ' + filterName + ' is not unregistered.');
            }
        }
    }

    return result.exp;
}

function walkBindingNode(node, bindingContext) {
    if (node.value) {
        node.root._modified = true;
        node.value = processBindingValue(node.value, bindingContext);
    } else if (node.children) {
        ko.utils.arrayForEach(node.children, function (node) {
            walkBindingNode(node, bindingContext);
        });
    }
}

function processBindingsString(bindingsString, bindingContext) {
    var ast = bindingParser.parse(bindingsString);
    walkBindingNode(ast, bindingContext);

    if (ast._modified) {
        bindingsString = bindingParser.stringify(ast);
    }

    return bindingsString;
}

var matchObservableAttrName = /^k-([\w\-]+)/i;

ko.bindingProvider.instance.preprocessNode = function preprocessNode(node) {
    if (node.nodeType !== 1 || !node.attributes) {
        return;
    }

    ko.utils.arrayForEach(node.attributes, function (attr) {
        if (matchObservableAttrName.test(attr.name)) {
            attr.value = processBindingValue(attr.value, null);
        }
    });
};

ko.bindingProvider.instance.getBindingsString = function getBindingsString(node, bindingContext) {
    var bindingsString = original.apply(this, arguments);

    if (bindingsString) {
        bindingsString = processBindingsString(bindingsString, bindingContext);
    }

    return bindingsString;
};

/**
 * core api
 *
 * ko.filter('filter_name', filter);
 * ko.filters.filter_name(value);
 */

var filters$1 = {};

function register(name, filter) {
    if (typeof name === 'function') {
        filter = name;
        name = filter.name;
    }

    if (!name) {
        throwError('Filter name is required.');
    }

    if (filters$1[name]) {
        throwError('Filter ' + name + ' is registered.');
    }

    filters$1[name] = filter;
}

ko.filter = register;
ko.filters = filters$1;
