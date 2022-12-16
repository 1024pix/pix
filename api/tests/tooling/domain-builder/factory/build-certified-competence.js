const { CertifiedCompetence } = require('../../../../lib/domain/read-models/CertifiedProfile');

const buildCertifiedCompetence = function buildCertifiedCompetence({
  id = 'someCompetenceId',
  name = 'someName',
  areaId = 'someAreaId',
  origin = 'Pix',
} = {}) {
  return new CertifiedCompetence({
    id,
    name,
    areaId,
    origin,
  });
};

module.exports = buildCertifiedCompetence;
