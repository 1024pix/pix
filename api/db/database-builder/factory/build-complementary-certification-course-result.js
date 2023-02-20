import databaseBuffer from '../database-buffer';
import buildComplementaryCertificationCourse from './build-complementary-certification-course';
import buildComplementaryCertification from './build-complementary-certification';
import buildCertificationCourse from './build-certification-course';
import _ from 'lodash';
import ComplementaryCertificationCourseResult from '../../../lib/domain/models/ComplementaryCertificationCourseResult';

export default function buildComplementaryCertificationCourseResult({
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
}

function _buildComplementaryCertificationCourse() {
  const { id: complementaryCertificationId } = buildComplementaryCertification();
  const { id: certificationCourseId } = buildCertificationCourse();
  return buildComplementaryCertificationCourse({
    complementaryCertificationId,
    certificationCourseId,
  });
}
