import jsonapiSerializer from 'jsonapi-serializer';
const { Serializer } = jsonapiSerializer;

function serialize(timeline) {
  return new Serializer('certification-candidate-timeline', {
    id: 'certificationCandidateId',
    attributes: ['events'],
  }).serialize(timeline);
}

export const timelineSerializer = { serialize };
