import * as injectedDataProtectionOfficerRepository from '../../infrastructure/repositories/data-protection-officer.repository.js';
const updateCertificationCenterDataProtectionOfficerInformation = async function ({
  dataProtectionOfficer,
  dataProtectionOfficerRepository = injectedDataProtectionOfficerRepository,
} = {}) {
  const { certificationCenterId } = dataProtectionOfficer;
  const dataProtectionOfficerToUpdate = await dataProtectionOfficerRepository.get({ certificationCenterId });

  if (!dataProtectionOfficerToUpdate) {
    return dataProtectionOfficerRepository.create(dataProtectionOfficer);
  }

  return dataProtectionOfficerRepository.update(dataProtectionOfficer);
};

export { updateCertificationCenterDataProtectionOfficerInformation };
