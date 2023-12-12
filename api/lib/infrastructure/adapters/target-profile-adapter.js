import { TargetProfile } from '../../domain/models/index.js';
import { Badge } from '../../../src/shared/domain/models/Badge.js';
import * as skillAdapter from './skill-adapter.js';

const fromDatasourceObjects = function ({ bookshelfTargetProfile, associatedSkillDatasourceObjects = [] }) {
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
};

export { fromDatasourceObjects };
