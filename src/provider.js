/**
 * override original knockout binding provider
 *
 * bindingProvider.instance.preprocessNode
 * bindingProvider.instance.getBindingsString
 */

import filterParser from './filter';
import bindingParser from './binding';

const original = ko.bindingProvider.instance.getBindingsString;

function wrapFilterArg (arg) {
    return `ko.unwrap(${arg})`;
}

function processBindingValue (bindingValue, bindingContext) {
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
                result.exp = `ko.filters.${filterName}(${filterArgsString})`;
            } else {
                throw new Error(`Filter ${filterName} is not unregistered.`);
            }
        }
    }

    return result.exp;
}

function walkBindingNode (node, bindingContext) {
    if (node.value) {
        node.root._modified = true;
        node.value = processBindingValue(node.value, bindingContext);
    } else if (node.children) {
        ko.arrayForEach(node.children, function (node) {
            walkBindingNode(node, bindingContext);
        });
    }
}

function processBindingsString (bindingsString, bindingContext) {
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

    ko.arrayForEach(node.attributes, (attr) => {
        if (matchObservableAttrName.test(attr.name)) {
            attr.value = processBindingValue(attr.value, null);
        }
    });
};

ko.bindingProvider.instance.getBindingsString = function getBindingsString (node, bindingContext) {
    var bindingsString = original.apply(this, arguments);

    if (bindingsString) {
        bindingsString = processBindingsString(bindingsString, bindingContext);
    }

    return bindingsString;
};