// construct array from an array like object
//
// @param {ArrayLike} target
// @param {Number} start start index
// @param {Number} end end index
// @return {Array}
function toArray(target, start, end) {
    const len = target.length;
    const result = [];

    start = start || 0;
    end = end === undefined ? len : end < 0 ? len + end : end;

    let i = end - start;

    while (i > 0) {
        i = i - 1;
        result[i] = target[i + start];
    }

    return result;
};

const CHAR_SINGLE = 0x27; // '
const CHAR_DOUBLE = 0x22; // "
const CHAR_LEFT_CURLY = 0x7b; // {
const CHAR_RIGHT_CURLY = 0x7d; // }
const CHAR_LEFT_SQUARE = 0x5b; // [
const CHAR_RIGHT_SQUARE = 0x5d; // ]
const CHAR_LEFT_PAREN = 0x28; // (
const CHAR_RIGHT_PAREN = 0x29; // (
const CHAR_SLASH = 0x5c; // \
const CHAR_PIPE = 0x7c; // |

let filterTokenRe = /[^\s'"]+|'[^']*'|"[^"]*"/g;
let inSingle;
let inDouble;
let curly;
let square;
let paren;
let str;
let exp;
let i;
let len;
let lastFilterIndex;
let prev;
let c;
let filters = null;

function pushFilter() {
    const currentExp = str.slice(lastFilterIndex, i).trim();

    if (currentExp) {
        let tokens = null;
        let filter = null;

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
        throw new Error('knockout.filter: Syntax Error');
    }

    return {
        exp: exp,
        filters: filters
    };
}

var filterParser = {
    parse: parse
};

function Node(key = '', value = '') {
    this.key = key.trim();
    this.value = value.trim();
    this.children = null;
}

Node.prototype.add = function add(node) {
    this.children = this.children || [];
    this.children.push(node);
    node.parent = this;
    node.root = rootNode || this;
};

Node.prototype.toString = function toString() {
    const key = this.key;
    const value = this.value;
    const children = this.children;
    let childrenString = '';

    if (key && value) {
        return `${ key }: ${ value }`;
    } else if (this.children) {
        childrenString = children.map(node => {
            return node.toString();
        }).join(', ');

        return key ? `${ key }: { ${ childrenString } }` : childrenString;
    } else {
        return '';
    }
};

const CHAR_SINGLE$1 = 0x27; // '
const CHAR_DOUBLE$1 = 0x22; // "
const CHAR_LEFT_CURLY$1 = 0x7b; // {
const CHAR_RIGHT_CURLY$1 = 0x7d; // }
const CHAR_LEFT_SQUARE$1 = 0x5b; // [
const CHAR_RIGHT_SQUARE$1 = 0x5d; // ]
const CHAR_LEFT_PAREN$1 = 0x28; // (
const CHAR_RIGHT_PAREN$1 = 0x29; // (
const CHAR_SLASH$1 = 0x5c; // \
const CHAR_COMMA = 0x2c; // ,
const CHAR_COLON = 0x3a; // :
const CHAR_Q_MARK = 0x3f; // ?

let spaceRe = /\s/;
let inSingle$1;
let inDouble$1;
let inTernary;
let inChildContext;
let curly$1;
let square$1;
let paren$1;
let str$1;
let contextKey;
let contextValue;
let i$1;
let len$1;
let lastIndex;
let prev$1;
let next;
let c$1;
let rootNode$1;
let contextNode;
function pushNode() {
    const node = new Node(contextKey, contextValue);

    contextNode.add(node);
    contextKey = contextValue = '';
    lastIndex = i$1 + 1;

    return node;
}

function reset$1() {
    rootNode$1 = new Node();
    contextNode = rootNode$1;
    inSingle$1 = inDouble$1 = inTernary = inChildContext = false;
    prev$1 = next = null;
    lastIndex = curly$1 = square$1 = paren$1 = 0;
    contextKey = contextValue = str$1 = '';
}

function peekBackFirstNoSpaceLetter() {
    let j = i$1 - 1;

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
            if (c$1 === CHAR_SINGLE$1 && prev$1 !== CHAR_SLASH$1) {
                inSingle$1 = !inSingle$1;
            }
        } else if (inDouble$1) {
            if (c$1 === CHAR_DOUBLE$1 && prev$1 !== CHAR_SLASH$1) {
                inDouble$1 = !inDouble$1;
            }
        } else if (c$1 === CHAR_SINGLE$1) {
            inSingle$1 = true;
        } else if (c$1 === CHAR_DOUBLE$1) {
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
        } else if (c$1 === CHAR_LEFT_CURLY$1 && contextKey && peekBackFirstNoSpaceLetter() === CHAR_COLON) {
            inChildContext = !inChildContext;
            contextNode = pushNode();
        } else if (c$1 === CHAR_RIGHT_CURLY$1 && contextKey && inChildContext) {
            inChildContext = !inChildContext;
            contextValue = str$1.slice(lastIndex, i$1);
            pushNode();
            contextNode = contextNode.parent;
        } else {
            switch (c$1) {
                case CHAR_LEFT_PAREN$1:
                    paren$1 += 1;
                    break;
                case CHAR_RIGHT_PAREN$1:
                    paren$1 -= 1;
                    break;
                case CHAR_LEFT_SQUARE$1:
                    square$1 += 1;
                    break;
                case CHAR_RIGHT_SQUARE$1:
                    square$1 -= 1;
                    break;
                case CHAR_LEFT_CURLY$1:
                    curly$1 += 1;
                    break;
                case CHAR_RIGHT_CURLY$1:
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
        throw new Error('knockout.filter: Syntax Error');
    }

    return rootNode$1;
}

function stringify(ast) {
    return ast.toString();
}

var bindingParser = {
    parse: parse$1,
    stringify: stringify
};

const original = ko.bindingProvider.instance.getBindingsString;

function wrapFilterArg(arg) {
    return `ko.unwrap(${ arg })`;
}

function processBindingValue(bindingValue, bindingContext) {
    const result = filterParser.parse(bindingValue);
    let filter = null;
    let filterName = '';
    let filterArgsString = '';
    let filterArgs = null;

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
                result.exp = `ko.filters.${ filterName }(${ filterArgsString })`;
            } else {
                throw new Error(`Filter ${ filterName } is not unregistered.`);
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
        ko.arrayForEach(node.children, function (node) {
            walkBindingNode(node, bindingContext);
        });
    }
}

function processBindingsString(bindingsString, bindingContext) {
    let ast = bindingParser.parse(bindingsString);
    walkBindingNode(ast, bindingContext);

    if (ast._modified) {
        bindingsString = bindingParser.stringify(ast);
    }

    return bindingsString;
}

const matchObservableAttrName = /^k-([\w\-]+)/i;

ko.bindingProvider.instance.preprocessNode = function preprocessNode(node) {
    if (node.nodeType !== 1 || !node.attributes) {
        return;
    }

    ko.arrayForEach(node.attributes, attr => {
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
const filters$1 = {};

function register(name, filter) {
    if (typeof name === 'function') {
        filter = name;
        name = filter.name;
    }

    if (!name) {
        throw new Error('Filter name is required.');
    }

    if (filters$1[name]) {
        throw new Error(`Filter ${ name } is registered.`);
    }

    filters$1[name] = filter;
}

ko.filter = register;
ko.filters = filters$1;