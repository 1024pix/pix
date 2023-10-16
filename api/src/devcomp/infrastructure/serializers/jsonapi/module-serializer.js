import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

function serialize(module) {
  return new Serializer('module', {
    transform(module) {
      return {
        id: module.id,
        title: module.title,
        element: module.list.map((element) => ({ id: element.id, content: element.content })),
      };
    },
    attributes: ['title', 'element'],
    element: {
      ref: 'id',
      includes: true,
      attributes: ['content'],
    },
  }).serialize(module);
}

export { serialize };
