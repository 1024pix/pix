const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(finalizedSessions) {
    return new Serializer('with-required-action-session', {
      transform(finalizedSession) {
        return { ...finalizedSession, id: finalizedSession.sessionId };
      },
      attributes: [
        'sessionId',
        'sessionDate',
        'sessionTime',
        'finalizedAt',
        'certificationCenterName',
      ],
    }).serialize(finalizedSessions);
  },
};
