import jsonapiSerializer from 'jsonapi-serializer';
import _ from 'lodash';

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
    attributes: ['room', 'examiner', 'accessCode', 'date', 'time', 'certificationCandidates', 'address'],
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
        'isCompanionActive',
      ],
    },
  }).serialize(sessions);
};

export { serialize };
