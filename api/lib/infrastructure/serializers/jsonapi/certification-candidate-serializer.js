const { Serializer, Deserializer } = require('jsonapi-serializer');

const { WrongDateFormatError } = require('../../../domain/errors');
const { isValidDate } = require('../../utils/date-utils');

module.exports = {
  serialize(certificationCandidates) {
    return new Serializer('certification-candidate', {
      attributes: [
        'firstName',
        'lastName',
        'birthdate',
        'birthProvinceCode',
        'birthCity',
        'birthCountry',
        'externalId',
        'extraTimePercentage',
      ],
    }).serialize(certificationCandidates);
  },

  deserialize(json) {
    if (!isValidDate(json.data.attributes.birthdate)) {
      throw new WrongDateFormatError();
    }

    return new Deserializer({ keyForAttribute: 'camelCase' })
      .deserialize(json);
  },
};
