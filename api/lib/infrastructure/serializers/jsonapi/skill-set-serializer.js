import { Serializer } from 'jsonapi-serializer';

const serialize = function (skillSet = {}) {
  return new Serializer('skill-sets', {
    ref: 'id',
    attributes: ['name', 'skillIds'],
  }).serialize(skillSet);
};

export { serialize };
