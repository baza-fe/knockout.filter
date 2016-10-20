knockout.filter
=====

<p>
    <a href="LICENSE">
        <img src="https://img.shields.io/badge/license-MIT-brightgreen.svg" alt="Software License" />
    </a>
    <a href="https://github.com/baza-fe/knockout.filter/issues">
        <img src="https://img.shields.io/github/issues/baza-fe/knockout.filter.svg" alt="Issues" />
    </a>
    <a href="http://standardjs.com/">
        <img src="https://img.shields.io/badge/code%20style-standard-brightgreen.svg" alt="JavaScript Style Guide" />
    </a>
    <a href="https://npmjs.org/package/knockout.filter">
        <img src="https://img.shields.io/npm/v/knockout.filter.svg?style=flat-squar" alt="NPM" />
    </a>
    <a href="https://github.com/baza-fe/knockout.filter/releases">
        <img src="https://img.shields.io/github/release/baza-fe/knockout.filter.svg" alt="Latest Version" />
    </a>
    <a href="https://travis-ci.org/baza-fe/knockout.filter">
        <img src="https://travis-ci.org/baza-fe/knockout.filter.svg?branch=master" />
    </a>
</p>

## Usage

Install from NPM:

```bash
npm install knockout.filter --save
```

```html
<script src="knockout.3.4.0.js"></script>
<script src="./node_modules/knockout.fitler/dest/knockout.filter.js"></script>
```

## Syntax

```html
<p data-bind="name | fitler_name arg1 arg2 ..."></p>
```

## Example

Define a fitler:

```js
ko.filter('uppercase', (str) => {
    return String(str).toUpperCase();
});
```

Define a view model:

```js
ko.applyBindings({
    text: 'knockout.filter'
});
```

Use filter in template:

```html
<p data-bind="text: text | uppercase"></p>
```

## Arguments

Define a fitler with arguments:

```js
ko.filter('wrap', (str, prefix = '', suffix = '') => {
    str = String(str);

    return `${prefix}${str}${suffix}`;
});
```
Use filter with arguments:

```html
<p data-bind="text: text | wrap '(' ')'"></p>
```

## Try

[jsFiddle Demo](https://jsfiddle.net/rye50t76/2/)

## License

MIT &copy; [BinRui.Guan](differui@gmail.com)
