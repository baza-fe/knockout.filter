/*
 * Examples:
 *
 * foo: bar, foo2: bar2
 * foo: bar, foo2: { foo3: bar3 }
 */

import Node from './node';

const CHAR_SINGLE       = 0x27; // '
const CHAR_DOUBLE       = 0x22; // "
const CHAR_LEFT_CURLY   = 0x7b; // {
const CHAR_RIGHT_CURLY  = 0x7d; // }
const CHAR_LEFT_SQUARE  = 0x5b; // [
const CHAR_RIGHT_SQUARE = 0x5d; // ]
const CHAR_LEFT_PAREN   = 0x28; // (
const CHAR_RIGHT_PAREN  = 0x29; // (
const CHAR_SLASH        = 0x5c; // \
const CHAR_COMMA        = 0x2c; // ,
const CHAR_COLON        = 0x3a; // :
const CHAR_Q_MARK       = 0x3f; // ?

let spaceRe = /\s/;
let inSingle, inDouble, inTernary, inChildContext, curly, square, paren;
let str, contextKey, contextValue;
let i, len, lastIndex, prev, next, c;
let rootNode, contextNode;

function pushNode () {
    const node = new Node(contextKey, contextValue);

    contextNode.add(node);
    contextKey = contextValue = '';
    lastIndex = i + 1;

    return node;
}

function reset () {
    rootNode = new Node();
    contextNode = rootNode;
    inSingle = inDouble = inTernary = inChildContext = false;
    prev = next = null;
    lastIndex = curly = square = paren = 0;
    contextKey = contextValue = str = '';
}

function peekBackFirstNoSpaceLetter () {
    let j = i - 1;

    while (j && spaceRe.test(str[j])) {
        j--;
    }

    return j > -1 ? str[j].charCodeAt(0) : 0;
}

function parse (s) {
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
        } else if (c === CHAR_Q_MARK) {
            next = s[i + 1].charCodeAt(0);
            inTernary = true;
        } else if (c === CHAR_COLON) {
            if (inTernary) {
                inTernary = false;
            } else {
                contextKey = str.slice(lastIndex, i);
                lastIndex = i + 1;
            }
        } else if (c === CHAR_COMMA && paren === 0) {
            if (contextKey) {
                contextValue = str.slice(lastIndex, i);
                pushNode();
            } else {
                lastIndex = i + 1;
            }
        } else if (
            c === CHAR_LEFT_CURLY &&
            contextKey &&
            peekBackFirstNoSpaceLetter() === CHAR_COLON
        ) {
            inChildContext = !inChildContext;
            contextNode = pushNode();
        } else if (
            c === CHAR_RIGHT_CURLY &&
            contextKey && inChildContext
        ) {
            inChildContext = !inChildContext;
            contextValue = str.slice(lastIndex, i);
            pushNode();
            contextNode = contextNode.parent;
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

    if (contextKey && lastIndex !== 0) {
        contextValue = str.slice(lastIndex);
        pushNode();
    }

    if (paren !== 0 || curly !== 0 || square !== 0) {
        throw new Error('knockout.filter: Syntax Error');
    }

    return rootNode;
}

function stringify (ast) {
    return ast.toString();
}

export default {
    parse: parse,
    stringify: stringify
};
