const SerieController = require('./serie-controller');

exports.register = function(server, options, next) {

  server.route([
    {
      method: 'GET',
      path: '/api/series',
      config: { handler: SerieController.list, tags: ['api'] }
    }
  ]);

  return next();
};

exports.register.attributes = {
  name: 'series-api',
  version: '1.0.0'
};
