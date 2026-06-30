import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

export function serialize({ scope, frameworkHistory }) {
  return new Serializer('framework-history', {
    id: 'scope',
    attributes: ['scope', 'history'],
  }).serialize({ scope, history: frameworkHistory });
}
