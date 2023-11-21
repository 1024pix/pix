import _ from 'lodash';
import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (sessions) {
  return new Serializer('sessionForSupervising', {
    transform(currentSessionForSupervising) {
      const cloneSession = _.cloneDeep(currentSessionForSupervising);

      cloneSession.certificationCandidates.forEach((candidate) => {
        candidate.enrolledComplementaryCertificationLabel = candidate.enrolledComplementaryCertification?.label ?? null;
        candidate.liveAlert = candidate.liveAlert ?? null;
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
        'liveAlert',
      ],
    },
  }).serialize(sessions);
};

export { serialize };
