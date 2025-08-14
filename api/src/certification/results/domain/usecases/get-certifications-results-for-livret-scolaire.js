import lodash from 'lodash';

import * as injectedCertificationLivretScolaireRepository from '../../infrastructure/repositories/certification-livret-scolaire-repository.js';
import * as injectedCompetenceTreeRepository from '../../infrastructure/repositories/competence-tree-repository.js';
import { CertificationsResults } from '../read-models/livret-scolaire/CertificationsResults.js';
import { Competence } from '../read-models/livret-scolaire/Competence.js';

const { sortBy } = lodash;

const getCertificationsResultsForLivretScolaire = async function ({
  uai,
  certificationLivretScolaireRepository = injectedCertificationLivretScolaireRepository,
  competenceTreeRepository = injectedCompetenceTreeRepository,
} = {}) {
  const [referential, certifications] = await Promise.all([
    competenceTreeRepository.get(),
    certificationLivretScolaireRepository.getCertificatesByOrganizationUAI(uai),
  ]);

  const areas = referential.areas;
  const competences = areas.flatMap(({ competences, code, title }) =>
    competences.map((competence) => {
      const area = { id: code, name: title };
      return new Competence({ area, id: competence.index, name: competence.name });
    }),
  );
  const sortedCompetences = sortBy(competences, 'id');

  return new CertificationsResults({ certifications, competences: sortedCompetences });
};

export { getCertificationsResultsForLivretScolaire };
