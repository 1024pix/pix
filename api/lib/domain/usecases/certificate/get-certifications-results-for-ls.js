const CertificationsResults = require('../../read-models/livret-scolaire/CertificationsResults');
const Competence = require('../../read-models/livret-scolaire/Competence');

module.exports = async function getCertificationsResultsForLS({
  uai,
  certificationLsRepository,
  competenceTreeRepository,
}) {
  //FIXME make this two calls in parallel to optimize response time
  const referential = await competenceTreeRepository.get();
  const areas = referential.areas;
  const competences = areas.flatMap((area) => area.competences).map((competence) => {
    const { code: id, title: name } = competence.area;
    const area = { id, name };
    return new Competence({ area, id: competence.index, name: competence.name });
  });

  const certifications = await certificationLsRepository.getCertificationsResultsByOrganizationUAI(uai);
  return new CertificationsResults({ certifications, competences });
};
