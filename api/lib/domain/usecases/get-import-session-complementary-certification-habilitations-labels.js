export default async function getImportSessionComplementaryCertificationHabilitationsLabels({
  certificationCenterId,
  complementaryCertificationHabilitationRepository,
}) {
  const habilitations = await complementaryCertificationHabilitationRepository.findByCertificationCenterId(
    certificationCenterId
  );

  const habilitationsLabels = habilitations.map((habilitation) => habilitation.label);

  return habilitationsLabels;
}
