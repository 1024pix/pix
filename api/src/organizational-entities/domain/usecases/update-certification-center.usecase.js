/**
 * @typedef {import('./index.js').CenterRepository} CenterRepository
 * @typedef {import('./index.js').CertificationCenterForAdminRepository} CertificationCenterForAdminRepository
 * @typedef {import('./index.js').ComplementaryCertificationHabilitationRepository} ComplementaryCertificationHabilitationRepository
 * @typedef {import('./index.js').DataProtectionOfficerRepository} DataProtectionOfficerRepository
 */

import { ComplementaryCertificationHabilitation, DataProtectionOfficer } from '../../../shared/domain/models/index.js';
import { CenterForAdminFactory } from '../models/factories/CenterForAdminFactory.js';
import * as certificationCenterCreationValidator from '../validators/certification-center-creation.validator.js';

/**
 * @param {Object} params
 * @param {number} params.certificationCenterId
 * @param {Object} params.certificationCenterInformation - see deserializer
 * @param {Array<number>} params.complementaryCertificationIds
 * @param {CenterRepository} params.centerRepository
 * @param {CertificationCenterForAdminRepository} params.certificationCenterForAdminRepository
 * @param {ComplementaryCertificationHabilitationRepository} params.complementaryCertificationHabilitationRepository
 * @param {DataProtectionOfficerRepository} params.dataProtectionOfficerRepository
 */
const updateCertificationCenter = async function ({
  certificationCenterId,
  certificationCenterInformation,
  complementaryCertificationIds,
  centerRepository,
  certificationCenterForAdminRepository,
  complementaryCertificationHabilitationRepository,
  dataProtectionOfficerRepository,
}) {
  certificationCenterCreationValidator.validate(certificationCenterInformation);

  await _updateCenter({
    certificationCenterId,
    certificationCenterInformation,
    complementaryCertificationIds,
    centerRepository,
    certificationCenterForAdminRepository,
    complementaryCertificationHabilitationRepository,
  });

  const dataProtectionOfficer = await _addOrUpdateDataProtectionOfficer({
    certificationCenterId,
    certificationCenterInformation,
    dataProtectionOfficerRepository,
  });

  const updatedCertificationCenter = await centerRepository.getById({ id: certificationCenterId });
  return CenterForAdminFactory.fromCenterAndDataProtectionOfficer({
    center: updatedCertificationCenter,
    dataProtectionOfficer,
  });
};

export { updateCertificationCenter };

/**
 * @param {Object} params
 * @param {CertificationCenterForAdminRepository} params.certificationCenterForAdminRepository
 * @param {ComplementaryCertificationHabilitationRepository} params.complementaryCertificationHabilitationRepository
 */
const _updateCenter = async ({
  certificationCenterInformation,
  certificationCenterId,
  complementaryCertificationIds,
  certificationCenterForAdminRepository,
  complementaryCertificationHabilitationRepository,
}) => {
  await certificationCenterForAdminRepository.update(certificationCenterInformation);

  await _updateHabilitations({
    certificationCenterId,
    complementaryCertificationIds,
    complementaryCertificationHabilitationRepository,
  });
};

/**
 * @param {Object} params
 * @param {ComplementaryCertificationHabilitationRepository} params.complementaryCertificationHabilitationRepository
 */
const _updateHabilitations = async ({
  certificationCenterId,
  complementaryCertificationIds,
  complementaryCertificationHabilitationRepository,
}) => {
  await complementaryCertificationHabilitationRepository.deleteByCertificationCenterId(certificationCenterId);

  if (complementaryCertificationIds) {
    for (const complementaryCertificationId of complementaryCertificationIds) {
      const complementaryCertificationHabilitation = new ComplementaryCertificationHabilitation({
        complementaryCertificationId: parseInt(complementaryCertificationId),
        certificationCenterId,
      });
      await complementaryCertificationHabilitationRepository.save(complementaryCertificationHabilitation);
    }
  }
};

/**
 * @param {Object} params
 * @param {DataProtectionOfficerRepository} params.dataProtectionOfficerRepository
 */
const _addOrUpdateDataProtectionOfficer = async ({
  certificationCenterId,
  certificationCenterInformation,
  dataProtectionOfficerRepository,
}) => {
  const dataProtectionOfficer = new DataProtectionOfficer({
    firstName: certificationCenterInformation.dataProtectionOfficerFirstName ?? '',
    lastName: certificationCenterInformation.dataProtectionOfficerLastName ?? '',
    email: certificationCenterInformation.dataProtectionOfficerEmail ?? '',
    certificationCenterId,
  });

  const dataProtectionOfficerFound = await dataProtectionOfficerRepository.get({
    certificationCenterId,
  });

  if (dataProtectionOfficerFound) {
    return dataProtectionOfficerRepository.update(dataProtectionOfficer);
  }

  return dataProtectionOfficerRepository.create(dataProtectionOfficer);
};
