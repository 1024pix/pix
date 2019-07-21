const { Serializer, Deserializer } = require('jsonapi-serializer');
const CertificationCandidate = require('../../../domain/models/CertificationCandidate');
const _ = require('lodash');

module.exports = {

  serialize(certificationCandidate) {

    return new Serializer('certification-candidate', {
      transform(record) {
        record.session = { id: record.sessionId };
        return record;
      },
      attributes: [
        'firstName',
        'lastName',
        'birthCountry',
        'birthProvince',
        'birthCity',
        'externalId',
        'birthdate',
        'extraTimePercentage',
        'createdAt',
        'session'],
      session: {
        ref: 'id',
        includes: false,
      },
    }).serialize(certificationCandidate);
  },

  async deserialize(json) {
    const certificationCandidate = await new Deserializer({ keyForAttribute: 'camelCase' }).deserialize(json);
    certificationCandidate.sessionId = _.get(json.data, ['relationships', 'session', 'data', 'id']);
    return new CertificationCandidate(certificationCandidate);
  },
};
