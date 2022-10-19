const { Serializer } = require('jsonapi-serializer');

const attributes = [
  'id',
  'firstName',
  'lastName',
  'birthdate',
  'extraTimePercentage',
  'authorizedToStart',
  'assessmentStatus',
  'startDateTime',
];

module.exports = {
  serialize(sessions) {
    return new Serializer('sessionForSupervising', {
      attributes: [
        'room',
        'examiner',
        'accessCode',
        'date',
        'time',
        'certificationCenterName',
        'certificationCandidates',
      ],
      typeForAttribute: (attribute) =>
        attribute === 'certificationCandidates' ? 'certification-candidate-for-supervising' : attribute,
      certificationCandidates: {
        included: true,
        ref: 'id',
        attributes: [...attributes],
      },
    }).serialize(sessions);
  },
};
