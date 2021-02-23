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
  const competences = areas.flatMap((area) => area.competences).map((competence) => {
    const { code: id, title: name } = competence.area;
    const area = { id, name };
    return new Competence({ area, id: competence.index, name: competence.name });
  });
  const sortedCompetences = sortBy(competences, 'id');

  return new CertificationsResults({ certifications, competences: sortedCompetences });
};
