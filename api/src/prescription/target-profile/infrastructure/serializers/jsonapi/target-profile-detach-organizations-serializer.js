import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (model) {
  return new Serializer('target-profile-detach-organizations', {
    id: 'targetProfileId',
    attributes: ['detachedOrganizationIds'],
  }).serialize(model);
};

export { serialize };
