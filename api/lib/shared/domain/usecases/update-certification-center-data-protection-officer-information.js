const updateCertificationCenterDataProtectionOfficerInformation = async function ({
  dataProtectionOfficer,
  dataProtectionOfficerRepository,
}) {
  const { certificationCenterId } = dataProtectionOfficer;
  const dataProtectionOfficerToUpdate = await dataProtectionOfficerRepository.get({ certificationCenterId });

  if (!dataProtectionOfficerToUpdate) {
    return dataProtectionOfficerRepository.create(dataProtectionOfficer);
  }

  return dataProtectionOfficerRepository.update(dataProtectionOfficer);
};

export { updateCertificationCenterDataProtectionOfficerInformation };
