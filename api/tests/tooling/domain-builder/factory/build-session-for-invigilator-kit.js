import { SessionForInvigilatorKit } from '../../../../src/certification/session/domain/read-models/SessionForInvigilatorKit.js';

const buildSessionForInvigilatorKit = function ({
  id = 123,
  examiner = 'Sherlock Holmes',
  address = '22b Baker Street',
  date = '2021-01-01',
  room = '28D',
  time = '14:30',
  accessCode = 'C3H6KL',
  invigilatorPassword = '3LME8',
  version = 2,
} = {}) {
  return new SessionForInvigilatorKit({
    id,
    examiner,
    address,
    date,
    room,
    time,
    accessCode,
    invigilatorPassword,
    version,
  });
};

export { buildSessionForInvigilatorKit };
