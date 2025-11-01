import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (context) {
  return new Serializer('context', {
    pluralizeType: false,
    keyForAttribute: 'camelCase',
    transform(context) {
      return { id: 0, ...context };
    },
    attributes: Object.keys(context),
  }).serialize(context);
};

export { serialize };
