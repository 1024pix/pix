import { SessionForAttendanceSheet } from '../.././../../src/certification/session/domain/read-models/SessionForAttendanceSheet.js';
import { buildCertificationCandidateForAttendanceSheet } from './build-certification-candidate-for-attendance-sheet.js';

const buildSessionForAttendanceSheet = function ({
  id = 123,
  date = '2023-01-01',
  time = '10:30',
  room = 'Room 42',
  examiner = 'Examinator',
  address = '22 rue des exams',
  certificationCenterName = 'Centre pour les pros',
  certificationCenterType = 'PRO',
  certificationCandidates = [buildCertificationCandidateForAttendanceSheet()],
  isOrganizationManagingStudents = false,
} = {}) {
  return new SessionForAttendanceSheet({
    id,
    examiner,
    address,
    date,
    room,
    time,
    certificationCenterName,
    certificationCenterType,
    certificationCandidates,
    isOrganizationManagingStudents,
  });
};

export { buildSessionForAttendanceSheet };
