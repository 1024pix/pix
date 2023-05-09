import { Serializer } from 'jsonapi-serializer';

const serialize = function (places) {
  return new Serializer('organization-places-capacity', {
    attributes: ['categories'],
  }).serialize(places);
};

export { serialize };
