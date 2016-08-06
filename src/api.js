/**
 * core api
 *
 * ko.filter('filter_name', filter);
 * ko.filters.filter_name(value);
 */
const filters = {};

function register (name, filter) {
    if (typeof name === 'function') {
        filter = name;
        name = filter.name;
    }

    if (!name) {
        throw new Error('Filter name is required.');
    }

    if (filters[name]) {
        throw new Error(`Filter ${name} is registered.`);
    }

    filters[name] = filter;
}

ko.filter = register;
ko.filters = filters;