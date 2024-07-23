import _ from 'lodash';

import { ComplementaryCertificationCourseResult } from '../../../src/certification/shared/domain/models/ComplementaryCertificationCourseResult.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildBadge } from './build-badge.js';
import { buildCertificationCourse } from './build-certification-course.js';
import { buildComplementaryCertification } from './build-complementary-certification.js';
import { buildComplementaryCertificationBadge } from './build-complementary-certification-badge.js';
import { buildComplementaryCertificationCourse } from './build-complementary-certification-course.js';

const buildComplementaryCertificationCourseResult = function ({
  id,
  complementaryCertificationCourseId,
  complementaryCertificationBadgeId,
  source = ComplementaryCertificationCourseResult.sources.PIX,
  acquired = true,
}) {
  id = id ?? databaseBuffer.getNextId();
  complementaryCertificationCourseId = _.isUndefined(complementaryCertificationCourseId)
    ? _buildComplementaryCertificationCourse().id
    : complementaryCertificationCourseId;
  complementaryCertificationBadgeId = _.isUndefined(complementaryCertificationBadgeId)
    ? _buildComplementaryCertificationBadge().id
    : complementaryCertificationBadgeId;
  return databaseBuffer.pushInsertable({
    tableName: 'complementary-certification-course-results',
    values: { id, complementaryCertificationCourseId, complementaryCertificationBadgeId, source, acquired },
  });
};

export { buildComplementaryCertificationCourseResult };

function _buildComplementaryCertificationCourse() {
  const { id: complementaryCertificationId } = buildComplementaryCertification();
  const { id: certificationCourseId } = buildCertificationCourse();
  return buildComplementaryCertificationCourse({
    complementaryCertificationId,
    certificationCourseId,
  });
}

function _buildComplementaryCertificationBadge() {
  const { id: badgeId } = buildBadge();
  const { id: complementaryCertificationId } = buildComplementaryCertification();
  return buildComplementaryCertificationBadge({ badgeId, complementaryCertificationId });
}
