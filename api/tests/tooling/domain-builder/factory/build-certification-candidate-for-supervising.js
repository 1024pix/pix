import { CertificationCandidateForSupervising } from '../../../../src/certification/session-management/domain/models/CertificationCandidateForSupervising.js';
import { CertificationCandidateForSupervisingV3 } from '../../../../src/certification/session-management/domain/models/CertificationCandidateForSupervisingV3.js';

const buildCertificationCandidateForSupervising = function ({
  id = 123,
  userId = 345,
  firstName = 'Monkey',
  lastName = 'D Lucien',
  birthdate = '1997-07-22',
  extraTimePercentage = 0.3,
  authorizedToStart = false,
  assessmentStatus = null,
  startDateTime = new Date('2022-10-01T12:00:00Z'),
  theoricalEndDateTime,
  enrolledComplementaryCertification,
  isComplementaryCertificationInProgress = false,
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
    isComplementaryCertificationInProgress,
  });
};

buildCertificationCandidateForSupervising.v3 = function ({
  id = 123,
  userId = 345,
  firstName = 'Monkey',
  lastName = 'D Lucien',
  birthdate = '1997-07-22',
  extraTimePercentage = 0.3,
  authorizedToStart = false,
  assessmentStatus = null,
  startDateTime = new Date('2022-10-01T12:00:00Z'),
  theoricalEndDateTime,
  liveAlert,
} = {}) {
  return new CertificationCandidateForSupervisingV3({
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
    liveAlert,
  });
};

export { buildCertificationCandidateForSupervising };
