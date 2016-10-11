knockout.filter
=====

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

[jsFiddle Demo](https://jsfiddle.net/differui/rye50t76/1/)

## License

MIT &copy; [BinRui.Guan](differui@gmail.com)
