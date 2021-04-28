// ts-check

const Session = require('../../../../lib/domain/models/Session');

/** @typedef {import('../../../../lib/domain/models/CertificationCandidate')} CertificationCandidate */

/**
 * @param {Object} obj
 * @param {number} [obj.id]
 * @param {string} [obj.accessCode]
 * @param {string} [obj.address]
 * @param {string} [obj.certificationCenter]
 * @param {number} [obj.certificationCenterId]
 * @param {string} [obj.date]
 * @param {string} [obj.description]
 * @param {string} [obj.examiner]
 * @param {string} [obj.room]
 * @param {string} [obj.time]
 * @param {string | null} [obj.examinerGlobalComment]
 * @param {Date | null} [obj.finalizedAt]
 * @param {Date | null} [obj.resultsSentToPrescriberAt]
 * @param {Date | null} [obj.publishedAt]
 * @param {number | null} [obj.assignedCertificationOfficerId]
 * @param {CertificationCandidate[]} [obj.certificationCandidates]
 *
 * @returns {Session}
 */
const buildSession = function({
  id = 123,
  accessCode = 'ABCD123',
  address = '4 avenue du général perlimpimpim',
  certificationCenter = 'Centre de certif pix',
  certificationCenterId = 1234,
  date = '2021-01-01',
  description = 'Bonne année',
  examiner = 'Flute',
  room = '28D',
  time = '14:30',
  examinerGlobalComment = '',
  finalizedAt = null,
  resultsSentToPrescriberAt = null,
  publishedAt = null,
  assignedCertificationOfficerId = null,
  certificationCandidates = [],
} = {}) {
  return new Session({
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
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    assignedCertificationOfficerId,
    certificationCandidates,
  });
};

/**
 * @param {Object} obj
 * @param {number} [obj.id]
 * @param {string} [obj.accessCode]
 * @param {string} [obj.address]
 * @param {string} [obj.certificationCenter]
 * @param {number} [obj.certificationCenterId]
 * @param {string} [obj.date]
 * @param {string} [obj.description]
 * @param {string} [obj.examiner]
 * @param {string} [obj.room]
 * @param {string} [obj.time]
 * @param {string} [obj.examinerGlobalComment]
 * @param {Date | null} [obj.finalizedAt]
 * @param {Date | null} [obj.resultsSentToPrescriberAt]
 * @param {Date | null} [obj.publishedAt]
 * @param {number | null} [obj.assignedCertificationOfficerId]
 * @param {CertificationCandidate[]} [obj.certificationCandidates]
 *
 * @returns {Session}
 */
buildSession.created = function({
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
    examinerGlobalComment: Session.NO_EXAMINER_GLOBAL_COMMENT,
    finalizedAt: null,
    resultsSentToPrescriberAt: null,
    publishedAt: null,
    assignedCertificationOfficerId: null,
  });
};

/**
 * @param {Object} obj
 * @param {number} [obj.id]
 * @param {string} [obj.accessCode]
 * @param {string} [obj.address]
 * @param {string} [obj.certificationCenter]
 * @param {number} [obj.certificationCenterId]
 * @param {string} [obj.date]
 * @param {string} [obj.description]
 * @param {string} [obj.examiner]
 * @param {string} [obj.room]
 * @param {string} [obj.time]
 * @param {CertificationCandidate[]} [obj.certificationCandidates]
 *
 * @returns {Session}
 */
buildSession.finalized = function({
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
    examinerGlobalComment: Session.NO_EXAMINER_GLOBAL_COMMENT,
    finalizedAt: new Date('2020-01-01'),
    resultsSentToPrescriberAt: null,
    publishedAt: null,
    assignedCertificationOfficerId: null,
  });
};

/**
 * @param {Object} obj
 * @param {number} [obj.id]
 * @param {string} [obj.accessCode]
 * @param {string} [obj.address]
 * @param {string} [obj.certificationCenter]
 * @param {number} [obj.certificationCenterId]
 * @param {string} [obj.date]
 * @param {string} [obj.description]
 * @param {string} [obj.examiner]
 * @param {string} [obj.room]
 * @param {string} [obj.time]
 * @param {CertificationCandidate[]} [obj.certificationCandidates]
 *
 * @returns {Session}
 */
buildSession.inProcess = function({
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
    examinerGlobalComment: Session.NO_EXAMINER_GLOBAL_COMMENT,
    finalizedAt: new Date('2020-01-01'),
    resultsSentToPrescriberAt: null,
    publishedAt: null,
    assignedCertificationOfficerId: 123,
  });
};

/**
 * @param {Object} obj
 * @param {number} [obj.id]
 * @param {string} [obj.accessCode]
 * @param {string} [obj.address]
 * @param {string} [obj.certificationCenter]
 * @param {number} [obj.certificationCenterId]
 * @param {string} [obj.date]
 * @param {string} [obj.description]
 * @param {string} [obj.examiner]
 * @param {string} [obj.room]
 * @param {string} [obj.time]
 * @param {CertificationCandidate[]} [obj.certificationCandidates]
 *
 * @returns {Session}
 */
buildSession.processed = function({
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
    examinerGlobalComment: Session.NO_EXAMINER_GLOBAL_COMMENT,
    finalizedAt: new Date('2020-01-01'),
    resultsSentToPrescriberAt: new Date('2020-01-02'),
    publishedAt: new Date('2020-01-02'),
    assignedCertificationOfficerId: 123,
  });
};

module.exports = buildSession;
