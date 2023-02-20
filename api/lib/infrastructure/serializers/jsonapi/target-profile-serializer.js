import { Serializer } from 'jsonapi-serializer';

export default {
  serialize(targetProfiles, meta) {
    return new Serializer('target-profile', {
      attributes: ['name', 'outdated', 'isPublic', 'ownerOrganizationId', 'isSimplifiedAccess'],
      meta,
    }).serialize(targetProfiles);
  },

  serializeId(targetProfileId) {
    return new Serializer('target-profile', {}).serialize({ id: targetProfileId });
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
