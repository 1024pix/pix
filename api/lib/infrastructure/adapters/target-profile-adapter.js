const TargetProfile = require('../../domain/models/TargetProfile');
const Badge = require('../../domain/models/Badge');
const skillAdapter = require('./skill-adapter');

module.exports = {
  fromDatasourceObjects({ bookshelfTargetProfile, associatedSkillDatasourceObjects = [] }) {
    const skills = associatedSkillDatasourceObjects.map(skillAdapter.fromDatasourceObject);
    const targetProfileBadges = bookshelfTargetProfile.related('badges');
    const badges = targetProfileBadges?.models?.map((badge) => new Badge(badge.attributes)) ?? [];

    return new TargetProfile({
      id: bookshelfTargetProfile.get('id'),
      name: bookshelfTargetProfile.get('name'),
      imageUrl: bookshelfTargetProfile.get('imageUrl'),
      isPublic: Boolean(bookshelfTargetProfile.get('isPublic')),
      isSimplifiedAccess: Boolean(bookshelfTargetProfile.get('isSimplifiedAccess')),
      ownerOrganizationId: bookshelfTargetProfile.get('ownerOrganizationId'),
      outdated: bookshelfTargetProfile.get('outdated'),
      skills,
      stages: [],
      badges,
    });
  },
};
