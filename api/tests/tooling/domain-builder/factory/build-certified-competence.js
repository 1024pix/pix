const { CertifiedCompetence } = require('../../../../lib/domain/read-models/CertifiedProfile');

const buildCertifiedCompetence = function buildCertifiedCompetence({
  id = 'someCompetenceId',
  name = 'someName',
  areaId = 'someAreaId',
} = {}) {
  return new CertifiedCompetence({
    id,
    name,
    areaId,
  });
};

module.exports = buildCertifiedCompetence;
