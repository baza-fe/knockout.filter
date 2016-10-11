const rollup = require('rollup').rollup;
const babelrc = require('babelrc-rollup').default;
const babel = require('rollup-plugin-babel');

rollup({
    entry: 'src/index',
    plugins: [
        babel(babelrc())
    ]
}).then(function (bundle) {
    bundle.write({
        dest: 'dest/knockout.filter.js',
        moduleName: 'knockout.fitler',
        format: 'iife'
    });
}).catch(console.error);
