import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serializeForParticipation(candidate) {
  return new Serializer('certification-candidate', {
    attributes: [
      'firstName',
      'lastName',
      'birthdate',
      'sessionId',
      'hasSeenCertificationInstructions',
      'subscription',
      'hasStartedTest',
      'doubleCertificationEligibility',
    ],
  }).serialize(candidate);
}
