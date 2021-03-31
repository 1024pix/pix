const Session = require('../../../../lib/domain/models/Session');

module.exports = function buildFinalizedSession({
  sessionId = 123,
  certificationCenterName = 'Centre de certif pix',
  sessionDate = '2020-12-01',
  sessionTime = '14:30',
  finalizedAt = '2021-01-12',
  publishedAt = null,
  isPublishable = true,
} = {}) {
  return new Session({
    sessionId,
    certificationCenterName,
    sessionDate,
    sessionTime,
    finalizedAt,
    publishedAt,
    isPublishable,
  });
};
