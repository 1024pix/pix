import jsonapiSerializer from 'jsonapi-serializer';
const { Deserializer, Serializer } = jsonapiSerializer;

import { Candidate } from '../../domain/models/Candidate.js';

export async function deserialize(json) {
  const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
  const deserializedCandidate = await deserializer.deserialize(json);
  deserializedCandidate.birthINSEECode = deserializedCandidate.birthInseeCode;

  return new Candidate({
    ...deserializedCandidate,
    id: deserializedCandidate?.id ? parseInt(deserializedCandidate?.id) : null,
    firstName: deserializedCandidate.firstName.trim(),
    lastName: deserializedCandidate.lastName.trim(),
  });
}

export const serializeForParticipation = function (candidate) {
  return new Serializer('certification-candidate', {
    attributes: [
      'firstName',
      'lastName',
      'birthdate',
      'sessionId',
      'hasSeenCertificationInstructions',
      'complementaryCertificationKey',
      'hasStartedTest',
    ],
  }).serialize(candidate);
};

export function serializeId(candidateId) {
  return new Serializer('certification-candidate', {}).serialize({ id: candidateId });
}
