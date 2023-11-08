import jsonapiSerializer from 'jsonapi-serializer';
import { QCU } from '../../../domain/models/element/QCU.js';

const { Serializer } = jsonapiSerializer;

function serialize(module) {
  return new Serializer('module', {
    transform(module) {
      return {
        id: module.slug,
        title: module.title,
        grains: module.grains.map((grain) => {
          return {
            id: grain.id,
            title: grain.title,
            type: grain.type,
            elements: grain.elements.map((element) => {
              if (element instanceof QCU) {
                return {
                  id: element.id,
                  instruction: element.instruction,
                  proposals: element.proposals,
                  solution: element.solution,
                  type: 'qcus',
                };
              }
              return {
                id: element.id,
                content: element.content,
                type: 'texts',
              };
            }),
          };
        }),
      };
    },
    attributes: ['title', 'grains'],
    grains: {
      ref: 'id',
      includes: true,
      attributes: ['title', 'type', 'elements'],
      elements: {
        ref: 'id',
        includes: true,
        attributes: ['content', 'instruction', 'proposals', 'type'],
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
