import { buildComplementaryCertification } from './build-complementary-certification.js';
import { buildComplementaryCertificationBadge } from './build-complementary-certification-badge.js';
import { databaseBuffer } from '../database-buffer.js';

const buildComplementaryCertificationCourse = function ({
  id = databaseBuffer.getNextId(),
  complementaryCertificationId,
  certificationCourseId,
  createdAt = new Date('2020-01-01'),
  complementaryCertificationBadgeId,
} = {}) {
  complementaryCertificationId = complementaryCertificationId
    ? complementaryCertificationId
    : buildComplementaryCertification().id;
  complementaryCertificationBadgeId = complementaryCertificationBadgeId
    ? complementaryCertificationBadgeId
    : buildComplementaryCertificationBadge({ complementaryCertificationId, badgeId: null }).id;
  const values = {
    id,
    complementaryCertificationId,
    certificationCourseId,
    createdAt,
    complementaryCertificationBadgeId,
  };

  return databaseBuffer.pushInsertable({
    tableName: 'complementary-certification-courses',
    values,
  });
};

export { buildComplementaryCertificationCourse };
