const ComplementaryCertificationCourseResultForJuryCertification = require('../../../../lib/domain/read-models/ComplementaryCertificationCourseResultsForJuryCertification');
const { PIX_EMPLOI_CLEA_V2 } = require('../../../../lib/domain/models/Badge').keys;

module.exports = function buildComplementaryCertificationCourseResultForJuryCertification({
  id = 1234,
  partnerKey = PIX_EMPLOI_CLEA_V2,
  acquired = true,
} = {}) {
  return new ComplementaryCertificationCourseResultForJuryCertification({
    id,
    partnerKey,
    acquired,
  });
};
