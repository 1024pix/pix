import TargetProfile from '../../domain/models/TargetProfile';
import Badge from '../../domain/models/Badge';
import skillAdapter from './skill-adapter';

export default {
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
