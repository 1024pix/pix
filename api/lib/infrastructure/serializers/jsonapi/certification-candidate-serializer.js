const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(certificationCandidates) {
    return new Serializer('certification-candidate', {
      attributes: [
        'lastName', 'firstName', 'birthdate', 'birthCity', 'birthProvinceCode', 'birthCountry', 'externalId', 'extraTimePercentage'
      ],
    }).serialize(certificationCandidates);
  }
};
