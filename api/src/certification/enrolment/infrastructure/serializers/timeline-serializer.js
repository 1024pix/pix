import jsonapiSerializer from 'jsonapi-serializer';
const { Serializer } = jsonapiSerializer;

const serialize = function (timeline) {
  return new Serializer('certification-candidate-timeline', {
    id: 'certificationCandidateId',
    attributes: ['events'],
  }).serialize(timeline);
};

export const timelineSerializer = { serialize };
