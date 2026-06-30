import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

function serialize(module) {
  return new Serializer('module', {
    transform(module) {
      const transformedModule = {
        id: module.id,
        shortId: module.shortId,
        slug: module.slug,
        title: module.title,
        isBeta: module.isBeta,
        version: module.version,
        details: module.details,
        glossary: module.glossary.map(({ word, definition }) => {
          return {
            word,
            definition,
          };
        }),
        sections: module.sections.map((section) => {
          return {
            id: section.id,
            type: section.type,
            grains: section.grains,
          };
        }),
      };

      if (module.redirectionUrl) {
        transformedModule.redirectionUrl = module.redirectionUrl;
      }

      return transformedModule;
    },
    attributes: ['shortId', 'slug', 'title', 'isBeta', 'version', 'sections', 'details', 'glossary', 'redirectionUrl'],
    sections: {
      ref: 'id',
      includes: true,
      attributes: ['type', 'grains'],
    },
    typeForAttribute(attribute) {
      if (attribute === 'sections') {
        return 'sections';
      }
      if (attribute === 'module') {
        return 'modules';
      }
    },
  }).serialize(module);
}

export const moduleSerializer = { serialize };
