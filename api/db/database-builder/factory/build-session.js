import buildCertificationCenter from './build-certification-center';
import databaseBuffer from '../database-buffer';
import _ from 'lodash';

export default function buildSession({
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
  };
  return databaseBuffer.pushInsertable({
    tableName: 'sessions',
    values,
  });
}
