import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer, Deserializer } = jsonapiSerializer;

import _ from 'lodash';

import { WrongDateFormatError } from '../../../domain/errors.js';
import { CertificationCandidate } from '../../../domain/models/CertificationCandidate.js';
import { isValidDate } from '../../utils/date-utils.js';

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
  if (json.data.attributes.birthdate && !isValidDate(json.data.attributes.birthdate, 'YYYY-MM-DD')) {
    throw new WrongDateFormatError(
      "La date de naissance du candidate à la certification n'a pas un format valide du type JJ/MM/AAAA",
    );
  }

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

export { deserialize, serialize };
