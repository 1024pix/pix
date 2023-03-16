import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (targetProfiles, meta) {
  return new Serializer('target-profile', {
    attributes: ['name', 'outdated', 'isPublic', 'ownerOrganizationId', 'isSimplifiedAccess'],
    meta,
  }).serialize(targetProfiles);
};

const serializeId = function (targetProfileId) {
  return new Serializer('target-profile', {}).serialize({ id: targetProfileId });
};

const deserializeCreationCommand = function (json) {
  return {
    name: json.data.attributes['name'],
    category: json.data.attributes['category'],
    description: json.data.attributes['description'],
    comment: json.data.attributes['comment'],
    isPublic: json.data.attributes['is-public'],
    imageUrl: json.data.attributes['image-url'],
    ownerOrganizationId: json.data.attributes['owner-organization-id'],
    tubes: json.data.attributes['tubes'],
  };
};

export { serialize, serializeId, deserializeCreationCommand };
