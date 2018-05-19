module.exports = {
    entry:  './Main/main.js',
    target: 'electron-main',
    module: {rules: require('./webpack.rules')}
};
