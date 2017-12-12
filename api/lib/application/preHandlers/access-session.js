const Boom = require('boom');

const SessionService = require('../../domain/services/session-service');

module.exports = {
  sessionIsOpened(request, reply) {

    if (SessionService.getCurrentCode() !== request.payload.data.attributes['session-code']) {
      return reply(Boom.unauthorized()).takeover();
    }

    delete request.payload.data.attributes['session-code'];

    reply(request);
  }
};
