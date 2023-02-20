import CertificationCandidateForSupervising from '../../../../lib/domain/models/CertificationCandidateForSupervising';

export default function buildCertificationCandidateForSupervising({
  id = 123,
  firstName = 'Monkey',
  lastName = 'D Luffy',
  birthdate = '1997-07-22',
  extraTimePercentage = 0.3,
  authorizedToStart = false,
  assessmentStatus = null,
  startDateTime = new Date('2022-10-01T12:00:00Z'),
} = {}) {
  return new CertificationCandidateForSupervising({
    id,
    firstName,
    lastName,
    birthdate,
    extraTimePercentage,
    authorizedToStart,
    assessmentStatus,
    startDateTime,
  });
}
