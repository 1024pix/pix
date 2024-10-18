import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (questResult) {
  return new Serializer('quest-result', {
    attributes: ['obtained', 'reward'],
  }).serialize(questResult);
};

export { serialize };
