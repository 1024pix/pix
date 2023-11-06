import { CertificationCandidateForAttendanceSheet } from '../.././../../src/certification/session/domain/read-models/CertificationCandidateForAttendanceSheet.js';

const buildCertificationCandidateForAttendanceSheet = function ({
  lastName = 'Laifrui',
  firstName = 'Jaime',
  birthdate = '1975-11-04',
  birthCity = 'Minneapolis',
  externalId = 'ENT4567',
  division = null,
  extraTimePercentage = null,
} = {}) {
  return new CertificationCandidateForAttendanceSheet({
    lastName,
    firstName,
    birthdate,
    birthCity,
    externalId,
    division,
    extraTimePercentage,
  });
};

export { buildCertificationCandidateForAttendanceSheet };
