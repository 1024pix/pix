import jsonapiSerializer from 'jsonapi-serializer';
const { Deserializer, Serializer } = jsonapiSerializer;

import { SUBSCRIPTION_TYPES } from '../../../shared/domain/constants.js';
import { Candidate } from '../../domain/models/Candidate.js';

export async function deserialize(json) {
  const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
  const deserializedCandidate = await deserializer.deserialize(json);
  deserializedCandidate.birthINSEECode = deserializedCandidate.birthInseeCode;
  const { attributes } = json.data;
  // TODO MVP - fixme when front will send exclusively subscriptions
  const subscriptions = [
    {
      type: SUBSCRIPTION_TYPES.CORE,
      complementaryCertificationId: null,
      complementaryCertificationLabel: null,
      complementaryCertificationKey: null,
    },
  ];
  if (attributes['complementary-certification'] && attributes['complementary-certification'].id) {
    subscriptions.push({
      type: SUBSCRIPTION_TYPES.COMPLEMENTARY,
      complementaryCertificationId: parseInt(attributes['complementary-certification'].id),
      complementaryCertificationLabel: attributes['complementary-certification'].label,
      complementaryCertificationKey: attributes['complementary-certification'].key,
    });
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
