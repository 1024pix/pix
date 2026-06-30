import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (combinedCourseParticipations, meta) {
  return new Serializer('combined-course-participations', {
    attributes: [
      'firstName',
      'lastName',
      'status',
      'createdAt',
      'division',
      'group',
      'updatedAt',
      'hasFormationItem',
      'nbModules',
      'nbCampaigns',
      'nbModulesCompleted',
      'nbCampaignsCompleted',
    ],
    meta,
  }).serialize(combinedCourseParticipations);
};

export const combinedCourseParticipationSerializer = { serialize };
