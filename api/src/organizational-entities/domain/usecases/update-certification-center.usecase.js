/**
 * @typedef {import('./index.js').CertificationCenterRepository} CertificationCenterRepository
 * @typedef {import('./index.js').CertificationCenterForAdminRepository} CertificationCenterForAdminRepository
 * @typedef {import('./index.js').ComplementaryCertificationHabilitationRepository} ComplementaryCertificationHabilitationRepository
 * @typedef {import('./index.js').DataProtectionOfficerRepository} DataProtectionOfficerRepository
 * @typedef {import('./index.js').OrganizationVerificationService} OrganizationVerificationService
 * @typedef {import('./index.js').StructureCategoryRepository} StructureCategoryRepository
 * @typedef {import('./index.js').StructureRepository} StructureRepository
 */

import { logger } from '../../../shared/infrastructure/utils/logger.js';
import { StructureNotFoundError } from '../errors.js';
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
 * @param {OrganizationVerificationService} params.organizationVerificationService
 * @param {StructureCategoryRepository} params.structureCategoryRepository
 * @param {StructureRepository} params.structureRepository
 */
const updateCertificationCenter = async function ({
  certificationCenterId,
  certificationCenterInformation,
  complementaryCertificationIds,
  certificationCenterRepository,
  certificationCenterForAdminRepository,
  complementaryCertificationHabilitationRepository,
  dataProtectionOfficerRepository,
  organizationVerificationService,
  structureCategoryRepository,
  structureRepository,
}) {
  certificationCenterCreationValidator.validate(certificationCenterInformation);

  await _updateStructureCategory({
    certificationCenterId,
    categoryId: certificationCenterInformation.categoryId,
    organizationVerificationService,
    structureCategoryRepository,
    structureRepository,
  });

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
 * @param {number} params.certificationCenterId
 * @param {number} params.categoryId
 * @param {OrganizationVerificationService} params.organizationVerificationService
 * @param {StructureCategoryRepository} params.structureCategoryRepository
 * @param {StructureRepository} params.structureRepository
 */
const _updateStructureCategory = async ({
  certificationCenterId,
  categoryId,
  organizationVerificationService,
  structureCategoryRepository,
  structureRepository,
}) => {
  await organizationVerificationService.checkStructureCategoryExists({
    structureCategoryId: categoryId,
    structureCategoryRepository,
  });

  const structure = await structureRepository.findByCertificationCenterId({ certificationCenterId });

  if (!structure) {
    logger.error({
      event: 'Not_found_structure',
      message: `Not found structure for certification center ${certificationCenterId}`,
    });
    throw new StructureNotFoundError({
      message: `Structure not found for certification center ${certificationCenterId}`,
      meta: { certificationCenterId },
    });
  }

  if (structure.categoryId === categoryId) return;

  await structureRepository.updateCategory({ structureId: structure.id, categoryId });
};

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
