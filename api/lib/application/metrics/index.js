const epimetheus = require('epimetheus');

exports.register = function(server, options, next) {
  epimetheus.instrument(server);

  return next();
};

exports.register.attributes = {
  name: 'metrics',
  version: '1.0.0'
};
