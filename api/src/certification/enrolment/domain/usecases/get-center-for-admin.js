/**
 * @typedef {import('./index.js').CenterRepository} CenterRepository
 * @typedef {import('../models/CenterForAdmin.js').CenterForAdmin} CenterForAdmin
 */

import { CenterForAdminFactory } from '../models/factories/CenterForAdminFactory.js';

/**
 * @param {Object} params
 * @param {CenterRepository} params.centerRepository
 * @returns {CenterForAdmin}
 */
const getCenterForAdmin = async function ({ id, centerRepository, dataProtectionOfficerRepository }) {
  const center = await centerRepository.getById({ id });
  const dataProtectionOfficer = await dataProtectionOfficerRepository.get({ certificationCenterId: id });
  return CenterForAdminFactory.fromCenterAndDataProtectionOfficer({ center, dataProtectionOfficer });
};

export { getCenterForAdmin };
