import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

function serialize(module) {
  return new Serializer('module', {
    transform(module) {
      return {
        id: module.slug,
        title: module.title,
        elements: module.list.map((element) => ({ id: element.id, content: element.content })),
      };
    },
    attributes: ['title', 'elements'],
    elements: {
      ref: 'id',
      includes: true,
      attributes: ['content'],
    },
  }).serialize(module);
}

export { serialize };
