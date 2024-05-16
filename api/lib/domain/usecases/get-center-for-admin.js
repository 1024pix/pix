import { CenterForAdmin } from '../models/CenterForAdmin.js';

const getCenterForAdmin = async function ({ id, centerRepository, dataProtectionOfficerRepository }) {
  const center = await centerRepository.getById({ id });
  const dataProtectionOfficer = dataProtectionOfficerRepository.get({ certificationCenterId: id });

  return new CenterForAdmin({ center, dataProtectionOfficer });
};

export { getCenterForAdmin };
