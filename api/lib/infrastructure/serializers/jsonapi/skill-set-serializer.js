import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (skillSet = {}) {
  return new Serializer('skill-sets', {
    ref: 'id',
    attributes: ['name', 'skillIds'],
  }).serialize(skillSet);
};

export { serialize };
