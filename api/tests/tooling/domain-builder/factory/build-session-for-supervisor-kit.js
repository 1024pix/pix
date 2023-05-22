import { SessionForSupervisorKit } from '../../../../lib/domain/read-models/SessionForSupervisorKit.js';

const buildSessionForSupervisorKit = function ({
  id = 123,
  examiner = 'Sherlock Holmes',
  address = '22b Baker Street',
  date = '2021-01-01',
  room = '28D',
  time = '14:30',
  accessCode = 'C3H6KL',
  supervisorPassword = '3LME8',
} = {}) {
  return new SessionForSupervisorKit({
    id,
    examiner,
    address,
    date,
    room,
    time,
    accessCode,
    supervisorPassword,
  });
};

export { buildSessionForSupervisorKit };
