/*
 * examples:
 *
 * hello | uppercase
 * hello | uppercase | wrap '(' ')'
 * function () { return hello } | uppercase
 * function () { return 'hello' } | uppercase
 */

import { toArray } from './util';

const CHAR_SINGLE       = 0x27; // '
const CHAR_DOUBLE       = 0x22; // "
const CHAR_LEFT_CURLY   = 0x7b; // {
const CHAR_RIGHT_CURLY  = 0x7d; // }
const CHAR_LEFT_SQUARE  = 0x5b; // [
const CHAR_RIGHT_SQUARE = 0x5d; // ]
const CHAR_LEFT_PAREN   = 0x28; // (
const CHAR_RIGHT_PAREN  = 0x29; // (
const CHAR_SLASH        = 0x5c; // \
const CHAR_PIPE         = 0x7c; // |

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
