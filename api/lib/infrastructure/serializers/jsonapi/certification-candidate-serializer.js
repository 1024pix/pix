const { Serializer, Deserializer } = require('jsonapi-serializer');

const { WrongDateFormatError } = require('../../../domain/errors');
const { isValidDate } = require('../../utils/date-utils');
const _ = require('lodash');

module.exports = {
  serialize(certificationCandidates) {
    return new Serializer('certification-candidate', {
      transform: function(certificationCandidate) {
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
        'externalId',
        'extraTimePercentage',
        'isLinked',
      ],
    }).serialize(certificationCandidates);
  },

  deserialize(json) {
    if (!isValidDate(json.data.attributes.birthdate, 'YYYY-MM-DD')) {
      throw new WrongDateFormatError('La date de naissance du candidate à la certification n\'a pas un format valide du type JJ/MM/AAAA');
    }

    delete json.data.attributes['is-linked'];

    return new Deserializer({ keyForAttribute: 'camelCase' })
      .deserialize(json);
  },
};
