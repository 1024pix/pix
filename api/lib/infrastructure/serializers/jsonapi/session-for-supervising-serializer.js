const { Serializer } = require('jsonapi-serializer');

const attributes = ['id', 'firstName', 'lastName', 'birthdate', 'extraTimePercentage'];

module.exports = {
  serialize(sessions) {
    return new Serializer('sessionForSupervising', {
      attributes: ['room', 'examiner', 'date', 'time', 'certificationCenterName', 'certificationCandidates'],
      certificationCandidates: {
        attributes: [...attributes],
      },
    }).serialize(sessions);
  },
};
