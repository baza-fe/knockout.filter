/*
 * examples:
 *
 * hello | uppercase
 * hello | uppercase | wrap '(' ')'
 * function () { return hello } | uppercase
 * function () { return 'hello' } | uppercase
 */

import { toArray } from './util';
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
    CHAR_PIPE
} from './tokens';

let filterTokenRe = /[^\s'"]+|'[^']*'|"[^"]*"/g;
let inSingle, inDouble, curly, square, paren;
let str, exp;
let i, len, lastFilterIndex, prev, c;
let filters = null;

function pushFilter () {
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

function reset () {
    exp = str = '';
    filters = null;
    inSingle = inDouble = false;
    lastFilterIndex = curly = square = paren = 0;
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
        } else if (
            c === CHAR_PIPE &&
            prev !== CHAR_PIPE &&
            str[i + 1].charCodeAt(0) !== CHAR_PIPE
        ) {
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

export default {
    parse: parse
};
