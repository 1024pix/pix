import { Serializer } from 'jsonapi-serializer';

const serialize = function (missions) {
  return new Serializer('missions', {
    attributes: ['name', 'areaCode'],
  }).serialize(missions);
};
export { serialize };
