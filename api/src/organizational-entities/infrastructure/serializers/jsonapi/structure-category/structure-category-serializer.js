import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (structureCategory) {
  return new Serializer('structure-categories', {
    attributes: ['label'],
  }).serialize(structureCategory);
};

export const structureCategorySerializer = { serialize };
