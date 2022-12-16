const { CertifiedTube } = require('../../../../lib/domain/read-models/CertifiedProfile');

const buildCertifiedTube = function buildCertifiedTube({
  id = 'someTubeId',
  name = 'someName',
  competenceId = 'someCompetenceId',
} = {}) {
  return new CertifiedTube({
    id,
    name,
    competenceId,
  });
};

module.exports = buildCertifiedTube;
