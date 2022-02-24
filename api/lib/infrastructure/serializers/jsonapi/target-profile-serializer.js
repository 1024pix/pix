const { Serializer } = require('jsonapi-serializer');

module.exports = {
  serialize(targetProfiles, meta) {
    return new Serializer('target-profile', {
      attributes: ['name', 'outdated', 'isPublic', 'ownerOrganizationId', 'isSimplifiedAccess'],
      meta,
    }).serialize(targetProfiles);
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
    };
  },
};
