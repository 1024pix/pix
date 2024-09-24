import jsonapiSerializer from 'jsonapi-serializer';
const { Deserializer, Serializer } = jsonapiSerializer;

import { Candidate } from '../../domain/models/Candidate.js';
import { Subscription } from '../../domain/models/Subscription.js';

export async function deserialize(json) {
  const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
  const deserializedCandidate = await deserializer.deserialize(json);
  deserializedCandidate.birthINSEECode = deserializedCandidate.birthInseeCode;
  const { attributes } = json.data;

  const subscriptions = attributes['subscriptions'].map(
    ({ type, complementaryCertificationId }) =>
      new Subscription({
        certificationCandidateId: null,
        type,
        complementaryCertificationId,
      }),
  );

  return new Candidate({
    ...deserializedCandidate,
    id: deserializedCandidate?.id ? parseInt(deserializedCandidate?.id) : null,
    subscriptions,
    firstName: deserializedCandidate.firstName.trim(),
    lastName: deserializedCandidate.lastName.trim(),
  });
}

export const serializeForParticipation = function (candidate) {
  return new Serializer('certification-candidate', {
    attributes: ['firstName', 'lastName', 'birthdate', 'sessionId', 'hasSeenCertificationInstructions'],
  }).serialize(candidate);
};

export function serializeId(candidateId) {
  return new Serializer('certification-candidate', {}).serialize({ id: candidateId });
}
