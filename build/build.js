const rollup = require('rollup').rollup;
const babel = require('rollup-plugin-babel');

rollup({
    entry: 'src/index',
    plugins: [
        babel()
    ]
}).then(function (bundle) {
    bundle.write({
        dest: 'dest/knockout.filter.cjs.js',
        format: 'cjs'
    });
    bundle.write({
        dest: 'dest/knockout.filter.es6.js',
        format: 'es6'
    });
}).catch(console.error);