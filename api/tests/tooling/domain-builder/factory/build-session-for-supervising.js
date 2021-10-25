const SessionForSupervising = require('../../../../lib/domain/read-models/SessionForSupervising');

module.exports = function buildSessionForSupervising({
  id = 123,
  certificationCenterName = 'Centre de certif pix',
  certificationCenterId = 565,
  examiner = 'Monkey D Luffy',
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
    date,
    room,
    time,
    certificationCandidates,
  });
};
