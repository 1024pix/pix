const JurySession = require('../../../../lib/domain/models/JurySession');
const domainBuilder = require('../domain-builder');
const _ = require('lodash');

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
  finalizedAt = null,
  resultsSentToPrescriberAt = null,
  publishedAt = null,
  assignedCertificationOfficer = null,
  juryComment = null,
  juryCommentedAt = null,
  juryCommentAuthor = null,
} = {}) {
  if (_.isUndefined(certificationCenterId)) {
    const certificationCenter = domainBuilder.buildCertificationCenter();
    certificationCenterId = certificationCenter.id;
    certificationCenterName = certificationCenter.id;
    certificationCenterType = certificationCenter.type;
    certificationCenterExternalId = certificationCenter.externalId;
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
    finalizedAt,
    resultsSentToPrescriberAt,
    publishedAt,
    assignedCertificationOfficer,
    juryComment,
    juryCommentedAt,
    juryCommentAuthor,
  });
};

module.exports = buildJurySession;
