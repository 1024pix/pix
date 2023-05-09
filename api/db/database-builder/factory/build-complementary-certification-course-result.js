import { databaseBuffer } from '../database-buffer.js';
import { buildComplementaryCertificationCourse } from './build-complementary-certification-course.js';
import { buildComplementaryCertification } from './build-complementary-certification.js';
import { buildCertificationCourse } from './build-certification-course.js';
import _ from 'lodash';
import { ComplementaryCertificationCourseResult } from '../../../lib/domain/models/ComplementaryCertificationCourseResult.js';

const buildComplementaryCertificationCourseResult = function ({
  complementaryCertificationCourseId,
  partnerKey,
  source = ComplementaryCertificationCourseResult.sources.PIX,
  acquired = true,
}) {
  complementaryCertificationCourseId = _.isUndefined(complementaryCertificationCourseId)
    ? _buildComplementaryCertificationCourse().id
    : complementaryCertificationCourseId;
  return databaseBuffer.objectsToInsert.push({
    tableName: 'complementary-certification-course-results',
    values: { complementaryCertificationCourseId, partnerKey, source, acquired },
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
