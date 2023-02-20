export default async function updateCertificationCenterDataProtectionOfficerInformation({
  dataProtectionOfficer,
  dataProtectionOfficerRepository,
}) {
  const { certificationCenterId } = dataProtectionOfficer;
  const dataProtectionOfficerToUpdate = await dataProtectionOfficerRepository.get({ certificationCenterId });

  if (!dataProtectionOfficerToUpdate) {
    return dataProtectionOfficerRepository.create(dataProtectionOfficer);
  }

  return dataProtectionOfficerRepository.update(dataProtectionOfficer);
}
