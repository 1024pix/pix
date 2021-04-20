const { decorateWithCleaStatusAndCompetenceTree } = require('./decorate-with-clea-status-and-competence-tree');
const { NotFoundError } = require('../../errors');

module.exports = async function getCertificationAttestation({
  userId,
  certificationId,
  certificationRepository,
  cleaCertificationResultRepository,
  assessmentResultRepository,
  competenceTreeRepository,
}) {
  const certificationAttestation = await certificationRepository.getCertificationAttestation({ id: certificationId });
  if (certificationAttestation.userId !== userId) {
    throw new NotFoundError();
  }

  return decorateWithCleaStatusAndCompetenceTree({
    certificationId,
    toBeDecorated: certificationAttestation,
    assessmentResultRepository,
    competenceTreeRepository,
    cleaCertificationResultRepository,
  });
};
