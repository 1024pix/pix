import { buildCertificationCenter } from './build-certification-center.js';
import { databaseBuffer } from '../database-buffer.js';
import _ from 'lodash';
import { buildUser } from './build-user.js';

const buildSession = function ({
  id = databaseBuffer.getNextId(),
  accessCode = 'FMKP39',
  address = '3 rue des églantines',
  certificationCenter = 'Centre de certif Pix',
  certificationCenterId,
  date = '2020-01-15',
  description = 'La session se déroule dans le jardin',
  examiner = 'Ginette',
  room = 'B315',
  time = '15:30:00',
  examinerGlobalComment = '',
  hasIncident = false,
  hasJoiningIssue = false,
  createdAt = new Date('2020-01-01'),
  finalizedAt = null,
  resultsSentToPrescriberAt = null,
  publishedAt = null,
  assignedCertificationOfficerId,
  juryComment = null,
  juryCommentAuthorId = null,
  juryCommentedAt = null,
  supervisorPassword = 'PIX12',
  version = 2,
  createdBy = null,
} = {}) {
  if (_.isUndefined(certificationCenterId)) {
    const builtCertificationCenter = buildCertificationCenter();
    certificationCenter = builtCertificationCenter.name;
    certificationCenterId = builtCertificationCenter.id;
  }
  if (_.isUndefined(createdBy)) {
    createdBy = buildUser();
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
    hasIncident,
    hasJoiningIssue,
    createdAt,
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    assignedCertificationOfficerId,
    juryComment,
    juryCommentAuthorId,
    juryCommentedAt,
    supervisorPassword,
    version,
    createdBy,
  };
  return databaseBuffer.pushInsertable({
    tableName: 'sessions',
    values,
  });
};

export { buildSession };
