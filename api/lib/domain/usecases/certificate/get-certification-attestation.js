const { NotFoundError } = require('../../errors');

module.exports = async function getCertificationAttestation({
  userId,
  certificationId,
  certificationAttestationRepository,
  assessmentResultRepository,
  competenceTreeRepository,
  resultCompetenceTreeService,
}) {
  const certificationAttestation = await certificationAttestationRepository.get(certificationId);
  if (certificationAttestation.userId !== userId) {
    throw new NotFoundError();
  }

  const resultCompetenceTree = await resultCompetenceTreeService.computeForCertification({
    certificationId: certificationAttestation.id,
    assessmentResultRepository,
    competenceTreeRepository,
  });
  certificationAttestation.setResultCompetenceTree(resultCompetenceTree);

  return certificationAttestation;
};
