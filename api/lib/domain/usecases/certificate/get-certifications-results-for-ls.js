import { CertificationsResults } from '../../read-models/livret-scolaire/CertificationsResults.js';
import { Competence } from '../../read-models/livret-scolaire/Competence.js';
import { sortBy } from 'lodash';

const getCertificationsResultsForLS = async function ({ uai, certificationLsRepository, competenceTreeRepository }) {
  const [referential, certifications] = await Promise.all([
    competenceTreeRepository.get(),
    certificationLsRepository.getCertificatesByOrganizationUAI(uai),
  ]);

  const areas = referential.areas;
  const competences = areas.flatMap(({ competences, code, title }) =>
    competences.map((competence) => {
      const area = { id: code, name: title };
      return new Competence({ area, id: competence.index, name: competence.name });
    })
  );
  const sortedCompetences = sortBy(competences, 'id');

  return new CertificationsResults({ certifications, competences: sortedCompetences });
};

export { getCertificationsResultsForLS };
