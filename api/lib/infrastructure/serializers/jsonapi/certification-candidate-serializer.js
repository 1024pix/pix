const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(certificationCandidates) {
    return new Serializer('certification-candidate', {
      attributes: [
        'lastName', 'firstName', 'birthdate', 'birthplace', 'externalId', 'extraTimePercentage'
      ],
    }).serialize(certificationCandidates);
  }
};
