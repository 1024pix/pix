import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

function serialize(module) {
  return new Serializer('module', {
    transform(module) {
      return {
        id: module.slug,
        title: module.title,
        transitionTexts: module.transitionTexts,
        grains: module.grains.map((grain) => {
          return {
            id: grain.id,
            title: grain.title,
            type: grain.type,
            elements: grain.elements.map((element) => {
              switch (element.type) {
                case 'qcu':
                  return {
                    ...element,
                    type: 'qcus',
                  };
                case 'qrocm':
                  return {
                    ...element,
                    proposals: element.proposals.map((proposal) => {
                      switch (proposal.type) {
                        case 'text':
                          return {
                            ...proposal,
                            type: 'text',
                          };
                        case 'input': {
                          return {
                            ...proposal,
                            type: 'input',
                          };
                        }
                        case 'select': {
                          return {
                            ...proposal,
                            type: 'select',
                          };
                        }
                      }
                    }),
                    type: 'qrocms',
                  };
                case 'text':
                  return {
                    ...element,
                    type: 'texts',
                  };
                case 'image':
                  return {
                    ...element,
                    type: 'images',
                  };
                case 'video':
                  return {
                    ...element,
                    type: 'videos',
                  };
              }
            }),
          };
        }),
      };
    },
    attributes: ['title', 'grains', 'transitionTexts'],
    grains: {
      ref: 'id',
      includes: true,
      attributes: ['title', 'type', 'elements'],
      elements: {
        ref: 'id',
        includes: true,
        attributes: [
          'content',
          'instruction',
          'proposals',
          'type',
          'url',
          'alt',
          'alternativeText',
          'isAnswerable',
          'subtitles',
          'transcription',
          'title',
        ],
      },
    },
    typeForAttribute(attribute, { type }) {
      if (attribute === 'elements') {
        return type;
      }
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
