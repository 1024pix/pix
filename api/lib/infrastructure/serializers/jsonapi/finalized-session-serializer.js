const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serialize(finalizedSessions) {
    return new Serializer('finalized-sessions', {
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
