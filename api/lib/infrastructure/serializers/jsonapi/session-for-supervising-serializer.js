const _ = require('lodash');
const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(sessions) {
    return new Serializer('sessionForSupervising', {
      transform(currentSessionForSupervising) {
        const cloneSession = _.cloneDeep(currentSessionForSupervising);

        cloneSession.certificationCandidates.forEach((candidate) => {
          candidate.enrolledComplementaryCertificationLabel =
            candidate.enrolledComplementaryCertification?.label ?? null;
        });

        return cloneSession;
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
        attributes: [
          'id',
          'userId',
          'firstName',
          'lastName',
          'birthdate',
          'extraTimePercentage',
          'authorizedToStart',
          'assessmentStatus',
          'startDateTime',
          'theoricalEndDateTime',
          'enrolledComplementaryCertificationLabel',
          'isStillEligibleToComplementaryCertification',
        ],
      },
    }).serialize(sessions);
  },
};
