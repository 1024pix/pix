const { Serializer, Deserializer } = require('jsonapi-serializer');
const moment = require('moment');
const { WrongDateFormatError } = require('../../../domain/errors');

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
    const birthdate = json.data.attributes.birthdate;
    if (!moment.utc(birthdate, 'YYYY-MM-DD').isValid()) {
      return Promise.reject(new WrongDateFormatError());
    }
    return new Deserializer({ keyForAttribute: 'camelCase' })
      .deserialize(json);
  },
};
