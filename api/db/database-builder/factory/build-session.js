const buildCertificationCenter = require('./build-certification-center');
const databaseBuffer = require('../database-buffer');
const _ = require('lodash');

module.exports = function buildSession({
  id = databaseBuffer.getNextId(),
  accessCode = 'ACC123A',
  address = '3 rue des églantines',
  certificationCenter = 'Centre de certif Pix',
  certificationCenterId,
  date = '2020-01-15',
  description = 'La session se déroule dans le jardin',
  examiner = 'Ginette',
  room = 'B315',
  time = '15:30:00',
  examinerGlobalComment = '',
  createdAt = new Date('2020-01-01'),
  finalizedAt = null,
  resultsSentToPrescriberAt = null,
  publishedAt = null,
  assignedCertificationOfficerId,
} = {}) {

  if (_.isUndefined(certificationCenterId)) {
    const builtCertificationCenter = buildCertificationCenter();
    certificationCenter = builtCertificationCenter.name;
    certificationCenterId = builtCertificationCenter.id;
  }
  const values = {
    id,
    accessCode,
    address,
    certificationCenter,
    certificationCenterId,
    date,
    description,
    examiner,
    room,
    time,
    examinerGlobalComment,
    createdAt,
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    assignedCertificationOfficerId,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'sessions',
    values,
  });
};
