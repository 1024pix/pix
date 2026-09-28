import { CertificationsResults } from '../read-models/livret-scolaire/CertificationsResults.js';
import { Competence } from '../read-models/livret-scolaire/Competence.js';

function sortBy(key) {
  return (a, b) => (a[key] > b[key] ? 1 : b[key] > a[key] ? -1 : 0);
}

export async function getCertificationsResultsForLivretScolaire({
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
  const sortedCompetences = competences.toSorted(sortBy('id'));

  return new CertificationsResults({ certifications, competences: sortedCompetences });
}
