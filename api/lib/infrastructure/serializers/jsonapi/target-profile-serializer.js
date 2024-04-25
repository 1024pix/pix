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
  const attributes = json.data.attributes;

  const deserializedData = {};

  if (attributes.name !== undefined) deserializedData.name = attributes.name;
  if (attributes.category !== undefined) deserializedData.category = attributes.category;
  if (attributes.description !== undefined) deserializedData.description = attributes.description;
  if (attributes.comment !== undefined) deserializedData.comment = attributes.comment;
  if (attributes['is-public'] !== undefined) deserializedData.isPublic = attributes['is-public'];
  if (attributes['image-url'] !== undefined) deserializedData.imageUrl = attributes['image-url'];
  if (attributes['owner-organization-id'] !== undefined)
    deserializedData.ownerOrganizationId = attributes['owner-organization-id'];
  if (attributes.tubes !== undefined) deserializedData.tubes = attributes.tubes;
  if (attributes['are-knowledge-elements-resettable'] !== undefined)
    deserializedData.areKnowledgeElementsResettable = attributes['are-knowledge-elements-resettable'];

  return deserializedData;
};

export { deserializeCreationCommand, serialize, serializeId };
