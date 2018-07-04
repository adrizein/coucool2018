const
    merge = require('webpack-merge'),
    request = require('sync-request');

const
    common = require('./webpack.common');

let httpsTunnels, publicUrl, localPort = 8080;
try {
    const
        res = request('GET', 'http://127.0.0.1:4040/api/tunnels'),
        body = JSON.parse(res.getBody('utf-8'));
    httpsTunnels = body.tunnels.filter(({proto}) => proto === 'https');
}
catch (err) {
    console.error('No ngrok tunnel available');

}

if (httpsTunnels && httpsTunnels.length) {
    publicUrl = httpsTunnels[0].public_url;
    localPort = httpsTunnels[0].config.addr.split(':')[1];
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
        port: localPort,
        public: publicUrl || `http://localhost:${localPort}`,
    },
});
