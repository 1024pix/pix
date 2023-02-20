import SessionForSupervising from '../../../../lib/domain/read-models/SessionForSupervising';

export default function buildSessionForSupervising({
  id = 123,
  certificationCenterName = 'Centre de certif pix',
  certificationCenterId = 565,
  examiner = 'Monkey D Luffy',
  accessCode = 'ACCES1',
  date = '2021-01-01',
  room = '28D',
  time = '14:30',
  certificationCandidates = [],
} = {}) {
  return new SessionForSupervising({
    id,
    certificationCenterName,
    examiner,
    certificationCenterId,
    accessCode,
    date,
    room,
    time,
    certificationCandidates,
  });
}
