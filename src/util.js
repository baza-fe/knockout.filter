const undefined = undefined;

// construct array from an array like object
//
// @param {ArrayLike} target
// @param {Number} start start index
// @param {Number} end end index
// @return {Array}
export function toArray (target, start, end) {
    const len = target.length;
    const result = [];

    start = start || 0;
    end = end === undefined ?
        len :
        end < 0 ? len + end : end;

    let i = end - start;

    while (i > 0) {
        i = i - 1;
        result[i] = target[i + start];
    }

    return result;
};