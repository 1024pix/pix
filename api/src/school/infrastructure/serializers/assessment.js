import { Serializer } from 'jsonapi-serializer';

const serialize = function (missionAssessment) {
  return new Serializer('assessment', {
    transform: (missionAssessment) => {
      return {
        ...missionAssessment,
        id: missionAssessment.assessmentId,
      };
    },
    attributes: ['missionId', 'organizationLearnerId'],
  }).serialize(missionAssessment);
};

export { serialize };
