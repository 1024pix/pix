import { SessionManagement } from '../../../../../../src/certification/session-management/domain/models/SessionManagement.js';

const buildSession = function ({
  id = 123,
  accessCode = 'BCDF234',
  address = '4 avenue du général perlimpimpim',
  certificationCenter = 'Centre de certif pix',
  certificationCenterId,
  date = '2021-01-01',
  description = 'Bonne année',
  examiner = 'Flute',
  room = '28D',
  time = '14:30',
  examinerGlobalComment = '',
  hasIncident = false,
  hasJoiningIssue = false,
  finalizedAt = null,
  resultsSentToPrescriberAt = null,
  publishedAt = null,
  assignedCertificationOfficerId = null,
  supervisorPassword = 'PIX12',
  certificationCandidates = [],
  version = 2,
  createdBy = null,
} = {}) {
  return new SessionManagement({
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
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    assignedCertificationOfficerId,
    supervisorPassword,
    certificationCandidates,
    version,
    createdBy,
  });
};

buildSession.created = function ({
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
  certificationCandidates,
  version = 2,
  createBy,
} = {}) {
  return buildSession({
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
    certificationCandidates,
    examinerGlobalComment: null,
    hasIncident: false,
    hasJoiningIssue: false,
    finalizedAt: null,
    resultsSentToPrescriberAt: null,
    publishedAt: null,
    assignedCertificationOfficerId: null,
    version,
    createBy,
  });
};

buildSession.finalized = function ({
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
  certificationCandidates,
  createBy,
} = {}) {
  return buildSession({
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
    certificationCandidates,
    examinerGlobalComment: null,
    hasIncident: false,
    hasJoiningIssue: false,
    finalizedAt: new Date('2020-01-01'),
    resultsSentToPrescriberAt: null,
    publishedAt: null,
    assignedCertificationOfficerId: null,
    createBy,
  });
};

buildSession.inProcess = function ({
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
  certificationCandidates,
  createBy,
} = {}) {
  return buildSession({
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
    certificationCandidates,
    examinerGlobalComment: null,
    hasIncident: false,
    hasJoiningIssue: false,
    finalizedAt: new Date('2020-01-01'),
    resultsSentToPrescriberAt: null,
    publishedAt: null,
    assignedCertificationOfficerId: 123,
    createBy,
  });
};

buildSession.processed = function ({
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
  certificationCandidates,
  createBy,
} = {}) {
  return buildSession({
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
    certificationCandidates,
    examinerGlobalComment: null,
    hasIncident: false,
    hasJoiningIssue: false,
    finalizedAt: new Date('2020-01-01'),
    resultsSentToPrescriberAt: new Date('2020-01-02'),
    publishedAt: new Date('2020-01-02'),
    assignedCertificationOfficerId: 123,
    createBy,
  });
};

export { buildSession as buildSessionManagement };