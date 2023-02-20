import { AlreadyExistingEntityError } from '../../domain/errors';

export default async function updateStudentNumber({
  organizationLearnerId,
  studentNumber,
  organizationId,
  supOrganizationLearnerRepository,
}) {
  const supOrganizationLearner = await supOrganizationLearnerRepository.findOneByStudentNumber({
    organizationId,
    studentNumber,
  });

  if (supOrganizationLearner) {
    throw new AlreadyExistingEntityError('STUDENT_NUMBER_EXISTS');
  }

  await supOrganizationLearnerRepository.updateStudentNumber(organizationLearnerId, studentNumber);
}
