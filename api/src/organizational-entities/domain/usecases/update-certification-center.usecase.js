/**
 * @typedef {import('./index.js').CertificationCenterRepository} CertificationCenterRepository
 * @typedef {import('./index.js').CertificationCenterForAdminRepository} CertificationCenterForAdminRepository
 * @typedef {import('./index.js').ComplementaryCertificationHabilitationRepository} ComplementaryCertificationHabilitationRepository
 * @typedef {import('./index.js').DataProtectionOfficerRepository} DataProtectionOfficerRepository
 * @typedef {import('./index.js').StructureCategoryRepository} StructureCategoryRepository
 */

import { StructureCategoryNotFound } from '../errors.js';
import { ComplementaryCertificationHabilitation } from '../models/ComplementaryCertificationHabilitation.js';
import { DataProtectionOfficer } from '../models/DataProtectionOfficer.js';
import { CenterForAdminFactory } from '../models/factories/CenterForAdminFactory.js';
import * as certificationCenterCreationValidator from '../validators/certification-center-creation.validator.js';

/**
 * @param {Object} params
 * @param {number} params.certificationCenterId
 * @param {Object} params.certificationCenterInformation - see deserializer
 * @param {Array<number>} params.complementaryCertificationIds
 * @param {CertificationCenterRepository} params.certificationCenterRepository
 * @param {CertificationCenterForAdminRepository} params.certificationCenterForAdminRepository
 * @param {ComplementaryCertificationHabilitationRepository} params.complementaryCertificationHabilitationRepository
 * @param {DataProtectionOfficerRepository} params.dataProtectionOfficerRepository
 * @param {StructureCategoryRepository} params.structureCategoryRepository
 */
const updateCertificationCenter = async function ({
  certificationCenterId,
  certificationCenterInformation,
  complementaryCertificationIds,
  certificationCenterRepository,
  certificationCenterForAdminRepository,
  complementaryCertificationHabilitationRepository,
  dataProtectionOfficerRepository,
  structureCategoryRepository,
}) {
  certificationCenterCreationValidator.validate(certificationCenterInformation);

  const { categoryId } = certificationCenterInformation;
  if (categoryId) {
    const existingStructureCategory = await structureCategoryRepository.findById(categoryId);
    if (!existingStructureCategory) {
      throw new StructureCategoryNotFound({
        message: `Structure category not found for id ${categoryId}`,
        meta: { structureCategoryId: categoryId },
      });
    }
  }

  await _updateCenter({
    certificationCenterId,
    certificationCenterInformation,
    complementaryCertificationIds,
    certificationCenterForAdminRepository,
    complementaryCertificationHabilitationRepository,
  });

  const dataProtectionOfficer = await _addOrUpdateDataProtectionOfficer({
    certificationCenterId,
    certificationCenterInformation,
    dataProtectionOfficerRepository,
  });

  const updatedCertificationCenter = await certificationCenterRepository.getById({ id: certificationCenterId });
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
