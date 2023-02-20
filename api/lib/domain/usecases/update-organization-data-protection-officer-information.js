export default async function ({ dataProtectionOfficer, dataProtectionOfficerRepository }) {
  const { organizationId } = dataProtectionOfficer;
  const dataProtectionOfficerToUpdate = await dataProtectionOfficerRepository.get({ organizationId });

  if (!dataProtectionOfficerToUpdate) {
    return dataProtectionOfficerRepository.create(dataProtectionOfficer);
  }

  return dataProtectionOfficerRepository.update(dataProtectionOfficer);
}
