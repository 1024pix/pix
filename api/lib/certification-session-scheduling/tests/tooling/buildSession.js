const { Session } = require('../../domain/models/Session');
const { AccessCode } = require('../../domain/models/AccessCode');

function _buildAccessCode({
  value = 'LOUP66',
} = {}) {
  return new AccessCode({ value });
}

const buildSession = ({
  id = 123,
  certificationCenterId = 456,
  certificationCenterName = 'Centre des boutes-en-train',
  accessCode = _buildAccessCode(),
  address = '1 rue des eglantines',
  examiner = 'Jean-Claude Dusse',
  room = '2ème porte droite',
  date = '2021-05-05',
  time = '15:00',
  description = 'Y va y avoir un gouter',
} = {}) => {
  return new Session({
    id,
    certificationCenterId,
    certificationCenterName,
    accessCode,
    address,
    examiner,
    room,
    date,
    time,
    description,
  });
};

buildSession.withAccessCode = ({
  id,
  certificationCenterId,
  certificationCenterName,
  accessCodeValue,
  address,
  examiner,
  room,
  date,
  time,
  description,
} = {}) => {
  return buildSession({
    id,
    certificationCenterId,
    certificationCenterName,
    accessCode: _buildAccessCode({ value: accessCodeValue }),
    address,
    examiner,
    room,
    date,
    time,
    description,
  });
};

module.exports = buildSession;
