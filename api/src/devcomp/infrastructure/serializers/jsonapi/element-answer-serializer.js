import jsonapiSerializer from 'jsonapi-serializer';
import { randomUUID } from 'crypto';

const { Serializer } = jsonapiSerializer;

function serialize(elementAnswer) {
  return new Serializer('element-answer', {
    transform(elementAnswer) {
      return {
        ...elementAnswer,
        id: elementAnswer.id ?? randomUUID(),
        correction: {
          ...elementAnswer.correction,
          id: elementAnswer.id ?? randomUUID(),
          status: elementAnswer.correction.status.status,
        },
      };
    },
    attributes: ['elementId', 'correction', 'userResponseValue'],
    correction: {
      ref: 'id',
      includes: true,
      attributes: ['feedback', 'status', 'solution'],
      type: 'correction-responses',
    },
    typeForAttribute(attribute, { type }) {
      if (attribute === 'elementAnswer') {
        return type;
      }
      if (attribute === 'correction') {
        return 'correction-responses';
      }
    },
  }).serialize(elementAnswer);
}

export { serialize };
