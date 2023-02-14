const { UnprocessableEntityError } = require('../../application/http-errors');
const Session = require('../models/Session');

module.exports = {
  async validate({ sessions }) {
    sessions.forEach((session) => {
      const domainSession = new Session(session);
      if (domainSession.isSessionScheduledInThePast()) {
        throw new UnprocessableEntityError(`Une session ne peut pas être programmée dans le passé`);
      }
    });
  },
};
