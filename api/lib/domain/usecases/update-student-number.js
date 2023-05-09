import { AlreadyExistingEntityError } from '../../domain/errors.js';

const updateStudentNumber = async function ({
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
};

export { updateStudentNumber };
