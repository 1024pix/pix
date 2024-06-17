/**
 * @typedef {import('./index.js').CenterRepository} CenterRepository
 */

import { CenterForAdmin } from '../../../session-management/domain/models/CenterForAdmin.js';

/**
 * @param {Object} params
 * @param {CenterRepository} params.centerRepository
 */
const getCenterForAdmin = async function ({ id, centerRepository, dataProtectionOfficerRepository }) {
  const center = await centerRepository.getById({ id });
  const dataProtectionOfficer = await dataProtectionOfficerRepository.get({ certificationCenterId: id });

  return new CenterForAdmin({ center, dataProtectionOfficer });
};

export { getCenterForAdmin };
