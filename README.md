knockout.filter
=====

## Usage

Install from NPM:

```bash
npm install knockout.filter --save
```

```html
<script src="knockout.3.4.0.js"></script>
<script src="./node_modules/knockout.fitler/dist/knockout.filter.cjs.js"></script>
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
<p data-bind="text：text | uppercase"></p>
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

## License

MIT &copy; [BinRui.Guan](differui@gmail.com)