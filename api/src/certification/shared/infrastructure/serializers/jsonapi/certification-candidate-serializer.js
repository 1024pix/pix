import jsonapiSerializer from 'jsonapi-serializer';
const { Serializer } = jsonapiSerializer;

export function serialize(certificationCandidate) {
  return new Serializer('certification-candidate', {
    attributes: ['firstName', 'lastName', 'birthdate', 'sessionId', 'hasSeenCertificationInstructions'],
  }).serialize(certificationCandidate);
}
