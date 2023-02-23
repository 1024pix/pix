const { Serializer, Deserializer } = require('jsonapi-serializer');
const CertificationCandidate = require('../../../domain/models/CertificationCandidate.js');
const { WrongDateFormatError } = require('../../../domain/errors.js');
const { isValidDate } = require('../../utils/date-utils.js');
const _ = require('lodash');

module.exports = {
  serialize(certificationCandidates) {
    return new Serializer('certification-candidate', {
      transform: function (certificationCandidate) {
        return {
          ...certificationCandidate,
          billingMode: certificationCandidate.translatedBillingMode,
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
        'complementaryCertifications',
        'billingMode',
        'prepaymentCode',
      ],
    }).serialize(certificationCandidates);
  },

  async deserialize(json) {
    if (json.data.attributes.birthdate && !isValidDate(json.data.attributes.birthdate, 'YYYY-MM-DD')) {
      throw new WrongDateFormatError(
        "La date de naissance du candidate à la certification n'a pas un format valide du type JJ/MM/AAAA"
      );
    }

    delete json.data.attributes['is-linked'];

    const deserializer = new Deserializer({ keyForAttribute: 'camelCase' });
    const deserializedCandidate = await deserializer.deserialize(json);
    deserializedCandidate.birthINSEECode = deserializedCandidate.birthInseeCode;
    delete deserializedCandidate.birthInseeCode;

    return new CertificationCandidate(deserializedCandidate);
  },
};
