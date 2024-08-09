import jsonapiSerializer from 'jsonapi-serializer';
const { Deserializer, Serializer } = jsonapiSerializer;

import { Candidate } from '../../domain/models/Candidate.js';
import { Subscription } from '../../domain/models/Subscription.js';

export async function deserialize(json) {
  const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
  const deserializedCandidate = await deserializer.deserialize(json);
  deserializedCandidate.birthINSEECode = deserializedCandidate.birthInseeCode;
  const { attributes } = json.data;

  const subscriptions = [];
  if (attributes?.['subscriptions']?.length > 0) {
    subscriptions.push(
      ...attributes['subscriptions'].map(
        ({ type, complementaryCertificationId }) =>
          new Subscription({
            certificationCandidateId: null,
            type,
            complementaryCertificationId,
          }),
      ),
    );
    // TODO MVP - remove else if when front stop uses complementary-certification attribute
  } else {
    subscriptions.push(Subscription.buildCore({ certificationCandidateId: null }));
    if (attributes['complementary-certification'] && attributes['complementary-certification'].id) {
      subscriptions.push(
        Subscription.buildComplementary({
          certificationCandidateId: null,
          complementaryCertificationId: parseInt(attributes['complementary-certification'].id),
        }),
      );
    }
  }

  return new Candidate({
    ...deserializedCandidate,
    id: deserializedCandidate?.id ? parseInt(deserializedCandidate?.id) : null,
    subscriptions,
    firstName: deserializedCandidate.firstName.trim(),
    lastName: deserializedCandidate.lastName.trim(),
  });
}

export function serializeId(candidateId) {
  return new Serializer('certification-candidate', {}).serialize({ id: candidateId });
}
