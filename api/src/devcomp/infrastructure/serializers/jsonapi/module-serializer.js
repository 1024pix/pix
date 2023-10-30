import jsonapiSerializer from 'jsonapi-serializer';
import { QCU } from '../../../domain/models/element/QCU.js';

const { Serializer } = jsonapiSerializer;

function serialize(module) {
  return new Serializer('module', {
    transform(module) {
      return {
        id: module.slug,
        title: module.title,
        elements: module.list.map((element) => {
          if (element instanceof QCU) {
            return {
              id: element.id,
              instruction: element.instruction,
              proposals: element.proposals,
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
    },
    attributes: ['title', 'elements'],
    elements: {
      ref: 'id',
      includes: true,
      attributes: ['content', 'instruction', 'proposals', 'type'],
    },
    typeForAttribute(attribute, { type }) {
      if (attribute === 'elements') {
        return type;
      }
      if (attribute === 'module') {
        return 'modules';
      }
    },
  }).serialize(module);
}

export { serialize };
