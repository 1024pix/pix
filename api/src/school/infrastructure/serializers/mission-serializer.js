import { Serializer } from 'jsonapi-serializer';

const serialize = function (missions) {
  return new Serializer('missions', {
    attributes: [
      'name',
      'cardImageUrl',
      'areaCode',
      'validatedObjectives',
      'learningObjectives',
      'competenceName',
      'startedBy',
      'introductionMediaUrl',
      'introductionMediaType',
      'introductionMediaAlt',
      'documentationUrl',
      'content',
    ],
  }).serialize(missions);
};
export { serialize };
