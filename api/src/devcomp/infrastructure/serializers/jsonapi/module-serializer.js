import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

function serialize(module) {
  return new Serializer('module', {
    transform(module) {
      return {
        id: module.slug,
        title: module.title,
        transitionTexts: module.transitionTexts,
        details: module.details,
        grains: module.grains.map((grain) => {
          if (grain.components) {
            return {
              id: grain.id,
              title: grain.title,
              type: grain.type,
              elements: grain.elements,
              components: grain.components,
            };
          } else {
            return {
              id: grain.id,
              title: grain.title,
              type: grain.type,
              elements: grain.elements,
            };
          }
        }),
      };
    },
    attributes: ['title', 'grains', 'transitionTexts', 'details'],
    grains: {
      ref: 'id',
      includes: true,
      attributes: ['title', 'type', 'elements', 'components'],
    },
    typeForAttribute(attribute) {
      if (attribute === 'grains') {
        return 'grains';
      }
      if (attribute === 'module') {
        return 'modules';
      }
    },
  }).serialize(module);
}

export { serialize };
