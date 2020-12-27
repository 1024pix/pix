const { Serializer } = require('jsonapi-serializer');

module.exports = {

  serializeOrganizationLogoUrl(organizationId, organizationLogoUrl) {
    const object = { id: organizationId, image: organizationLogoUrl };
    return new Serializer('organization-logo-url', {
      attributes: ['image'],
    }).serialize(object);
  },

  serializeTargetProfileImageUrl(targetProfileId, targetProfileImageUrl) {
    const object = { id: targetProfileId, image: targetProfileImageUrl };
    return new Serializer('target-profile-image-url', {
      attributes: ['image'],
    }).serialize(object);
  },
};
