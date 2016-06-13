var Express = require('express');
var webpack = require('webpack');

var config = require('../src/config');
var webpackConfig = require('./dev.config');
var compiler = webpack(webpackConfig);

var host = config.host || 'localhost';
var httpPort = (Number(config.port) + 1) || 3001;
var httpsPort = 5001;
var port = httpPort;
var useHttps = true;
if (useHttps) {
  port = httpsPort;
  protocol = 'https';
}
var serverOptions = {
  contentBase: protocol + '://' + host + ':' + port,
  quiet: true,
  noInfo: true,
  hot: true,
  inline: true,
  lazy: false,
  https: true,
  publicPath: webpackConfig.output.publicPath,
  headers: {'Access-Control-Allow-Origin': '*'},
  stats: {colors: true}
};

var app = new Express();

/* Note: using staging server url, remove .testing() for production
Using .testing() will overwrite the debug flag with true */ 
const LEX = require('letsencrypt-express').testing();

const lex = LEX.create({
  configDir: require('os').homedir() + '/letsencrypt/etc',
  approveRegistration: function approve(hostname, cb) { // leave `null` to disable automatic registration
    // Note: this is the place to check your database to get the user associated with this domain
    cb(null, {
      domains: [hostname],
      email: 'petersuggate@gmail.com',
      agreeTos: true
    });
  }
});

lex.onRequest = app;

lex.listen([81], [httpsPort + 1], function onRequest() {
  const protocol = ('requestCert' in this) ? 'https' : 'http';
  console.log('Listening at ' + protocol + '://localhost:' + this.address().port);
});

app.use(require('webpack-dev-middleware')(compiler, serverOptions));
app.use(require('webpack-hot-middleware')(compiler));

app.listen(httpPort, function onAppListening(err) {
  if (err) {
    console.error(err);
  } else {
    console.info('==> 🚧  Webpack development server listening on port %s', port);
  }
});
