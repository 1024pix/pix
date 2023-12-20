import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer, Deserializer } = jsonapiSerializer;

import { CertificationCandidate } from '../../../../../../lib/domain/models/CertificationCandidate.js';
import _ from 'lodash';

/**
 *@deprecated this serializer has been deprecated due to API migration, please migrate current usages to session/infrastructure/serializers/jsonapi/certification-candidate-serializer.js
  {@link file://./../../../../../certification/session/infrastructure/serializers/jsonapi/certification-candidate-serializer.js}
 */
const serialize = function (certificationCandidates) {
  return new Serializer('certification-candidate', {
    transform: function (certificationCandidate) {
      return {
        ...certificationCandidate,
        isLinked: !_.isNil(certificationCandidate.userId),
      };
    },
    attributes: [
      'firstName',
      'lastName',
      'birthdate',
      'birthProvinceCode',
      'birthCity',
      'birthCountry',
      'email',
      'resultRecipientEmail',
      'externalId',
      'extraTimePercentage',
      'isLinked',
      'organizationLearnerId',
      'sex',
      'birthINSEECode',
      'birthPostalCode',
      'complementaryCertification',
      'billingMode',
      'prepaymentCode',
    ],
  }).serialize(certificationCandidates);
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

export { serialize, deserialize };
