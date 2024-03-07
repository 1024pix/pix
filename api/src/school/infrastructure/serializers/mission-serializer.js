import { Serializer } from 'jsonapi-serializer';

const serialize = function (missions) {
  return new Serializer('missions', {
    attributes: ['name', 'areaCode', 'validatedObjectives', 'learningObjectives', 'competenceName', 'startedBy'],
  }).serialize(missions);
};
export { serialize };
