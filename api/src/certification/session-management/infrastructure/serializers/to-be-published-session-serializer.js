import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (finalizedSessions) {
  return new Serializer('to-be-published-session', {
    transform(finalizedSession) {
      return { ...finalizedSession, id: finalizedSession.sessionId };
    },
    attributes: ['sessionId', 'sessionDate', 'sessionTime', 'finalizedAt', 'certificationCenterName'],
  }).serialize(finalizedSessions);
};

export { serialize };
