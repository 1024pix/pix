import jsonapiSerializer from 'jsonapi-serializer';

const { Serializer } = jsonapiSerializer;

const serialize = function (targetProfiles, meta) {
  return new Serializer('target-profile', {
    attributes: ['name', 'outdated', 'isSimplifiedAccess'],
    meta,
  }).serialize(targetProfiles);
};

const serializeId = function (targetProfileId) {
  return new Serializer('target-profile', {}).serialize({ id: targetProfileId });
};

const deserialize = function (json) {
  const attributes = json.data.attributes;

  const deserializedData = {};

  if (attributes.name !== undefined) deserializedData.name = attributes.name;
  if (attributes['internal-name'] !== undefined) deserializedData.internalName = attributes['internal-name'];
  if (attributes.category !== undefined) deserializedData.category = attributes.category;
  if (attributes.description !== undefined) deserializedData.description = attributes.description;
  if (attributes.comment !== undefined) deserializedData.comment = attributes.comment;
  if (attributes['image-url'] !== undefined) deserializedData.imageUrl = attributes['image-url'];
  if (attributes.tubes !== undefined) deserializedData.tubes = attributes.tubes;
  if (attributes['are-knowledge-elements-resettable'] !== undefined)
    deserializedData.areKnowledgeElementsResettable = attributes['are-knowledge-elements-resettable'];

  return deserializedData;
};

export { deserialize, serialize, serializeId };
