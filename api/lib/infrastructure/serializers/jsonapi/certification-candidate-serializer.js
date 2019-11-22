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
        'externalId',
        'extraTimePercentage',
        'isLinked',
      ],
    }).serialize(certificationCandidates);
  },

  deserialize(json) {
    if (!isValidDate(json.data.attributes.birthdate)) {
      throw new WrongDateFormatError();
    }

    delete json.data.attributes['is-linked'];

    return new Deserializer({ keyForAttribute: 'camelCase' })
      .deserialize(json);
  },
};
