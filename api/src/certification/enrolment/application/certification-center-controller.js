import { usecases } from '../domain/usecases/index.js';
import { divisionSerializer } from '../infrastructure/serializers/division-serializer.js';
import { studentCertificationSerializer } from '../infrastructure/serializers/student-certification-serializer.js';

async function getStudents(request) {
  const certificationCenterId = request.params.certificationCenterId;
  const sessionId = request.params.sessionId;

  const { filter, page } = request.query;
  if (filter.divisions && !Array.isArray(filter.divisions)) {
    filter.divisions = [filter.divisions];
  }

  const { data, pagination } = await usecases.findStudentsForEnrolment({
    certificationCenterId,
    sessionId,
    page,
    filter,
  });
  return studentCertificationSerializer.serialize(data, pagination);
}

async function getDivisions(request) {
  const certificationCenterId = request.params.certificationCenterId;
  const divisions = await usecases.findDivisionsByCertificationCenter({
    certificationCenterId,
  });

  return divisionSerializer.serialize(divisions);
}

export const certificationCenterController = { getStudents, getDivisions };
