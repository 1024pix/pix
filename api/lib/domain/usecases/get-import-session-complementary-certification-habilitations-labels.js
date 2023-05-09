const getImportSessionComplementaryCertificationHabilitationsLabels = async function ({
  certificationCenterId,
  complementaryCertificationHabilitationRepository,
}) {
  const habilitations = await complementaryCertificationHabilitationRepository.findByCertificationCenterId(
    certificationCenterId
  );

  const habilitationsLabels = habilitations.map((habilitation) => habilitation.label);

  return habilitationsLabels;
};

export { getImportSessionComplementaryCertificationHabilitationsLabels };
