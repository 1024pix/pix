const Boom = require('boom');

module.exports = {

  simulateInternalError(request, reply) {
    reply(Boom.internal());
  }
};
