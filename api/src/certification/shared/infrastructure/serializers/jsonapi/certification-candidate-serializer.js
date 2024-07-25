import jsonapiSerializer from 'jsonapi-serializer';

import { CertificationCandidate } from '../../../../../shared/domain/models/index.js';

const { Deserializer, Serializer } = jsonapiSerializer;

const serializeForApp = function (certificationCandidate) {
  return new Serializer('certification-candidate', {
    attributes: ['firstName', 'lastName', 'birthdate', 'sessionId', 'hasSeenCertificationInstructions'],
  }).serialize(certificationCandidate);
};

const deserialize = async function (json) {
  delete json.data.attributes['is-linked'];

  const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
  const deserializedCandidate = await deserializer.deserialize(json);
  deserializedCandidate.birthINSEECode = deserializedCandidate.birthInseeCode;
  delete deserializedCandidate.birthInseeCode;

  return new CertificationCandidate({
    ...deserializedCandidate,
    firstName: deserializedCandidate.firstName.trim(),
    lastName: deserializedCandidate.lastName.trim(),
  });
};

export { deserialize, serializeForApp };
