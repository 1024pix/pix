const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(targetProfiles, meta) {
    return new Serializer('target-profile', {
      attributes: ['name', 'outdated', 'isPublic', 'ownerOrganizationId', 'isSimplifiedAccess'],
      meta,
    }).serialize(targetProfiles);
  },

  serializeId(targetProfileId) {
    return new Serializer('target-profile', {}).serialize({ id: targetProfileId });
  },

  deserialize(json) {
    return {
      name: json.data.attributes['name'],
      ownerOrganizationId: json.data.attributes['owner-organization-id'],
      isPublic: json.data.attributes['is-public'],
      imageUrl: json.data.attributes['image-url'],
      skillIds: json.data.attributes['skill-ids'],
      comment: json.data.attributes['comment'],
      description: json.data.attributes['description'],
      category: json.data.attributes['category'],
      tubes: json.data.attributes['tubes-selection'],
    };
  },

  deserializeCreationCommand(json) {
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
  },
};
