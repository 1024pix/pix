import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (model) {
  return new Serializer('target-profile-attach-organization', {
    id: 'targetProfileId',
    attributes: ['duplicatedIds', 'attachedIds'],
  }).serialize(model);
};

export { serialize };
