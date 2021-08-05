const bluebird = require('bluebird');

module.exports = async function getMultipleCertificationAttestationsByDivision({
  organizationId,
  division,
  certificationAttestationRepository,
  assessmentResultRepository,
  competenceTreeRepository,
  resultCompetenceTreeService,
}) {
  const certificationAttestations = await certificationAttestationRepository.findByDivisionForScoIsManagingStudentsOrganization({ organizationId, division });

  await bluebird.mapSeries(certificationAttestations,
    async (certificationAttestation) => {

      const resultCompetenceTree = await resultCompetenceTreeService.computeForCertification({
        certificationId: certificationAttestation.id,
        assessmentResultRepository,
        competenceTreeRepository,
      });

      certificationAttestation.setResultCompetenceTree(resultCompetenceTree);
    });

  return certificationAttestations;
};
