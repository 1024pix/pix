import { Serializer } from 'jsonapi-serializer';

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

const serialize = function (sessions) {
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
      attributes: [...attributes, 'isStillEligibleToComplementaryCertification', 'userId'],
    },
  }).serialize(sessions);
};

export { serialize };
