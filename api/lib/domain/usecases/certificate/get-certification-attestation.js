const { decorateWithCleaStatusAndCompetenceTree } = require('./decorate-with-clea-status-and-competence-tree');
const { NotFoundError } = require('../../errors');
const CertificationAttestation = require('../../models/CertificationAttestation');

module.exports = async function getCertificationAttestation({
  userId,
  certificationId,
  certificationRepository,
  cleaCertificationStatusRepository,
  assessmentResultRepository,
  competenceTreeRepository,
}) {
  const certificationAttestation = await certificationRepository.getCertificationAttestation({ id: certificationId });
  if (certificationAttestation.userId !== userId) {
    throw new NotFoundError();
  }

  const certificateWithCleaAndCompetenceTree = await decorateWithCleaStatusAndCompetenceTree({
    certificationId,
    toBeDecorated: certificationAttestation,
    assessmentResultRepository,
    competenceTreeRepository,
    cleaCertificationStatusRepository,
  });

  return new CertificationAttestation({ ...certificateWithCleaAndCompetenceTree });
};
