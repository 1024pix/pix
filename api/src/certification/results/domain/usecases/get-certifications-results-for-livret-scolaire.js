import lodash from 'lodash';

import { CertificationsResults } from '../read-models/livret-scolaire/CertificationsResults.js';
import { Competence } from '../read-models/livret-scolaire/Competence.js';

const { sortBy } = lodash;

const getCertificationsResultsForLivretScolaire = async function ({
  uai,
  certificationLivretScolaireRepository,
  competenceTreeRepository,
}) {
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
