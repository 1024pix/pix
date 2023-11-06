import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

function serialize(correctionResponse) {
  return new Serializer('correction-response', {
    transform(correctionResponse) {
      return {
        ...correctionResponse,
        id: correctionResponse.solutionId,
        globalResult: correctionResponse.globalResult.status,
      };
    },
    attributes: ['globalResult', 'feedback', 'solutionId'],
  }).serialize(correctionResponse);
}

export { serialize };
