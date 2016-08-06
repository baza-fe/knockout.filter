export default (str, prefix = '', suffix = '') => {
    str = String(str);

    return `${prefix}${str}${suffix}`;
};