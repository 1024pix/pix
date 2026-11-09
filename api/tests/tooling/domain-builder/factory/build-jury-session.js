import _ from 'lodash';

import { JurySession } from '../../../../src/certification/session-management/domain/models/JurySession.js';
import { domainBuilder } from '../domain-builder.js';

const buildJurySession = function ({
  id = 123,
  certificationCenterName = null,
  certificationCenterType = null,
  certificationCenterId = null,
  certificationCenterExternalId = null,
  address = '11 allée des Peupliers 54180 Houdemont',
  room = '28D',
  examiner = 'M. Salicales',
  date = '2021-01-01',
  time = '14:30',
  accessCode = 'ABCD123',
  description = 'Bonne année',
  examinerGlobalComment,
  createdAt = new Date('2021-01-01'),
  finalizedAt = null,
  resultsSentToPrescriberAt = null,
  publishedAt = null,
  assignedCertificationOfficer = null,
  juryComment = null,
  juryCommentedAt = null,
  juryCommentAuthor = null,
  hasIncident = false,
  hasJoiningIssue = false,
  version = 2,
  sessionStatus,
  counters,
} = {}) {
  if (_.isUndefined(certificationCenterId)) {
    const certificationCenter = domainBuilder.buildCertificationCenter();
    certificationCenterId = certificationCenter.id;
    certificationCenterName = certificationCenter.id;
    certificationCenterType = certificationCenter.type;
    certificationCenterExternalId = certificationCenter.externalId;
  }

  if (counters === undefined) {
    counters = domainBuilder.certification.sessionManagement.buildJurySessionCounters();
  }

  return new JurySession({
    id,
    certificationCenterName,
    certificationCenterType,
    certificationCenterId,
    certificationCenterExternalId,
    address,
    room,
    examiner,
    date,
    time,
    accessCode,
    description,
    examinerGlobalComment,
    createdAt,
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    assignedCertificationOfficer,
    juryComment,
    juryCommentedAt,
    juryCommentAuthor,
    hasIncident,
    hasJoiningIssue,
    version,
    counters,
    sessionStatus,
  });
};

export { buildJurySession };
