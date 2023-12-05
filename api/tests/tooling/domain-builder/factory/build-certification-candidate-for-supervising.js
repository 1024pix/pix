import { CertificationCandidateForSupervising } from '../../../../src/certification/supervision/domain/models/CertificationCandidateForSupervising.js';

const buildCertificationCandidateForSupervising = function ({
  id = 123,
  userId = 345,
  firstName = 'Monkey',
  lastName = 'D Luffy',
  birthdate = '1997-07-22',
  extraTimePercentage = 0.3,
  authorizedToStart = false,
  assessmentStatus = null,
  startDateTime = new Date('2022-10-01T12:00:00Z'),
  theoricalEndDateTime,
  enrolledComplementaryCertification,
  stillValidBadgeAcquisitions = [],
} = {}) {
  return new CertificationCandidateForSupervising({
    id,
    userId,
    firstName,
    lastName,
    birthdate,
    extraTimePercentage,
    authorizedToStart,
    assessmentStatus,
    startDateTime,
    theoricalEndDateTime,
    enrolledComplementaryCertification,
    stillValidBadgeAcquisitions,
  });
};

export { buildCertificationCandidateForSupervising };
