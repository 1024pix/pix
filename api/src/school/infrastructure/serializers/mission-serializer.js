import { Serializer } from '../../../shared/infrastructure/serializers/jsonapi/base-serializer.js';

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
