const Boom = require('boom');

module.exports = {
  simulateInternalError() {
    throw Boom.internal();
  },
};
