import { CertifiedTube } from '../../../../lib/domain/read-models/CertifiedProfile';

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

export default buildCertifiedTube;
