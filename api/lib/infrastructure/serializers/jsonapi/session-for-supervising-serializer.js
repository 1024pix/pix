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
  'enrolledComplementaryCertification',
];

module.exports = {
  serialize(sessions) {
    return new Serializer('sessionForSupervising', {
      transform(currentSessionForSupervising) {
        currentSessionForSupervising.certificationCandidates.forEach((certificationCandidate) => {
          certificationCandidate.isStillEligibleToComplementaryCertification =
            certificationCandidate.isStillEligibleToComplementaryCertification();
        });
        return currentSessionForSupervising;
      },
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
        attributes: [...attributes, 'isStillEligibleToComplementaryCertification', 'userId'],
      },
    }).serialize(sessions);
  },
};
