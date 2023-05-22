import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (finalizedSessions) {
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
      'assignedCertificationOfficerName',
    ],
  }).serialize(finalizedSessions);
};

export { serialize };
