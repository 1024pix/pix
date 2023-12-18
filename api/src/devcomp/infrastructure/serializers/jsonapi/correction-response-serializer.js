import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

function serialize(correctionResponse) {
  return new Serializer('correction-response', {
    transform(correctionResponse) {
      return {
        ...correctionResponse,
        id: correctionResponse.solution,
        status: correctionResponse.status.status,
      };
    },
    attributes: ['status', 'feedback', 'solution'],
  }).serialize(correctionResponse);
}

export { serialize };
