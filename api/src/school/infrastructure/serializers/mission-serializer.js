import { Serializer } from 'jsonapi-serializer';

const serialize = function (missions) {
  return new Serializer('mission', {
    pluralizeType: false,
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

export const missionSerializer = { serialize };
