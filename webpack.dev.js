const
    merge = require('webpack-merge'),
    request = require('sync-request');

const
    common = require('./webpack.common');

const
    res = request('GET', 'http://127.0.0.1:4040/api/tunnels'),
    body = JSON.parse(res.getBody('utf-8')),
    httpsTunnels = body.tunnels.filter(({proto}) => proto === 'https');

if (!httpsTunnels.length) {
    throw new Error('No https tunnel available');
}

module.exports = merge(common, {
    devtool: 'inline-source-map',
    devServer: {
        contentBase: './dist',
        compress: true,
        host: '0.0.0.0',
        allowedHosts: [
            '.ngrok.io',
        ],
        public: httpsTunnels[0].public_url,
    },
});
