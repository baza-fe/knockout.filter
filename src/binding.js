/*
 * examples:
 *
 * foo: bar, foo2: bar2
 * foo: bar, foo2: { foo3: bar3 }
 */

import Node from './node';
import { throwError } from './util';
import {
    CHAR_SINGLE,
    CHAR_DOUBLE,
    CHAR_LEFT_CURLY,
    CHAR_RIGHT_CURLY,
    CHAR_LEFT_SQUARE,
    CHAR_RIGHT_SQUARE,
    CHAR_LEFT_PAREN,
    CHAR_RIGHT_PAREN,
    CHAR_SLASH,
    CHAR_COMMA,
    CHAR_COLON,
    CHAR_Q_MARK
} from './tokens'

let spaceRe = /\s/;
let inSingle, inDouble, inTernary, inChildContext, curly, square, paren;
let str, contextKey, contextValue;
let i, len, lastIndex, prev, next, c;
let rootNode, contextNode;

function pushNode () {
    const node = new Node(contextKey, contextValue);

    node.root = rootNode;
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
        throwError('Syntax Error');
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
