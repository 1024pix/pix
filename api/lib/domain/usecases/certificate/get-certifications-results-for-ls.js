const CertificationsResults = require('../../read-models/livret-scolaire/CertificationsResults');
const Competence = require('../../read-models/livret-scolaire/Competence');
const sortBy = require('lodash/sortBy');

module.exports = async function getCertificationsResultsForLS({
  uai,
  certificationLsRepository,
  competenceTreeRepository,
}) {

  const [referential, certifications] = await Promise.all([
    competenceTreeRepository.get(),
    certificationLsRepository.getCertificatesByOrganizationUAI(uai),
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
