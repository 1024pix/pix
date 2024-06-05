import { SessionForSupervising } from '../../../../src/certification/session-management/domain/read-models/SessionForSupervising.js';

const buildSessionForSupervising = function ({
  id = 123,
  certificationCenterId = 565,
  examiner = 'Monkey D Luffy',
  accessCode = 'ACCES1',
  date = '2021-01-01',
  room = '28D',
  time = '14:30',
  certificationCandidates = [],
  address = 'centre de certification 1',
} = {}) {
  return new SessionForSupervising({
    id,
    examiner,
    certificationCenterId,
    accessCode,
    date,
    room,
    time,
    certificationCandidates,
    address,
  });
};

export { buildSessionForSupervising };
