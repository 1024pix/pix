import { AlreadyExistingEntityError } from '../../../../shared/domain/errors.js';
import * as injectedSupOrganizationLearnerRepository from '../../infrastructure/repositories/sup-organization-learner-repository.js';

const updateStudentNumber = async function ({
  organizationLearnerId,
  studentNumber,
  organizationId,
  supOrganizationLearnerRepository = injectedSupOrganizationLearnerRepository,
} = {}) {
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
