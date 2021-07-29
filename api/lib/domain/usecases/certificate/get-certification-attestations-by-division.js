const bluebird = require('bluebird');

module.exports = async function getCertificationAttestationByDivision({
  division,
  organizationId,
  certificationAttestationRepository,
  resultCompetenceTreeService,
  assessmentResultRepository,
  competenceTreeRepository,
}) {

  const attestationsWithoutCompetenceTree = await certificationAttestationRepository.getByOrganizationIdAndDivision({ organizationId, division });
  const attestationsWithCompetenceTree = await bluebird.mapSeries(attestationsWithoutCompetenceTree, async (attestation) => {
    const resultCompetenceTree = await resultCompetenceTreeService.computeForCertification({
      certificationId: attestation.id,
      assessmentResultRepository,
      competenceTreeRepository,
    });
    attestation.setResultCompetenceTree(resultCompetenceTree);
    return attestation;
  });

  return attestationsWithCompetenceTree;
};
