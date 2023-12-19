import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer, Deserializer } = jsonapiSerializer;

import { CertificationCandidate } from '../../../../../../lib/domain/models/CertificationCandidate.js';
import _ from 'lodash';

const serialize = function (certificationCandidates) {
  return new Serializer('certification-candidate', {
    transform: function (certificationCandidate) {
      return {
        ...certificationCandidate,
        complementaryCertification: _.isNil(certificationCandidate.complementaryCertification)
          ? null
          : {
              id: certificationCandidate.complementaryCertification.id,
              label: certificationCandidate.complementaryCertification.label,
              key: certificationCandidate.complementaryCertification.key,
            },
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
