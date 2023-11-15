import jsonapiSerializer from 'jsonapi-serializer';
import { randomUUID } from 'crypto';

const { Serializer } = jsonapiSerializer;

function serialize(elementAnswer) {
  return new Serializer('element-answer', {
    transform(elementAnswer) {
      return {
        ...elementAnswer,
        id: randomUUID(),
        correction: {
          ...elementAnswer.correction,
          id: randomUUID(),
          status: elementAnswer.correction.status.status,
        },
      };
    },
    attributes: ['elementId', 'correction', 'userResponseValue'],
    correction: {
      ref: 'id',
      includes: true,
      attributes: ['feedback', 'status', 'solutionId'],
    },
  }).serialize(elementAnswer);
}

export { serialize };
