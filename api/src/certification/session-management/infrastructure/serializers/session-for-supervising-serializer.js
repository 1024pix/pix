import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (sessions) {
  return new Serializer('sessionForSupervising', {
    attributes: ['room', 'examiner', 'accessCode', 'date', 'time', 'certificationCandidates', 'address'],
    transform(record) {
      record.certificationCandidates = record.candidates;
      return record;
    },
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
        'subscription',
        'isStillEligibleToDoubleCertification',
        'challengeLiveAlert',
        'companionLiveAlert',
      ],
    },
  }).serialize(sessions);
};

export { serialize };
