import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { UnableToAttachCertificationCenterToOrganization } from '../errors.js';
import { ComplementaryCertificationHabilitation } from '../models/ComplementaryCertificationHabilitation.js';
import { Structure } from '../models/Structure.js';
import * as certificationCenterCreationValidator from '../validators/certification-center-creation.validator.js';

/**
 *
 * @param{object} params
 * @param{CertificationCenter} params.certificationCenter
 * @param{string[]} params.complementaryCertificationIds
 * @param{number} [params.organizationId]
 * @param{ComplementaryCertificationHabilitationRepository} params.complementaryCertificationHabilitationRepository
 * @param{CertificationCenterForAdminRepository} params.certificationCenterForAdminRepository
 * @param{DataProtectionOfficerRepository} params.dataProtectionOfficerRepository
 * @param{StructureRepository} params.structureRepository
 * @returns {Promise<*>}
 */
const createCertificationCenter = withTransaction(async function ({
  certificationCenter,
  complementaryCertificationIds,
  complementaryCertificationHabilitationRepository,
  certificationCenterForAdminRepository,
  dataProtectionOfficerRepository,
  structureRepository,
}) {
  certificationCenterCreationValidator.validate(certificationCenter);

  const { organizationId } = certificationCenter;

  const structure = organizationId
    ? await _getOrganizationStructure({ organizationId, structureRepository })
    : new Structure({});

  const createdCertificationCenter = await certificationCenterForAdminRepository.save(certificationCenter);

  structure.attachCertificationCenter({ certificationCenterId: createdCertificationCenter.id });
  await structureRepository.save(structure);

  for (const complementaryCertificationId of complementaryCertificationIds) {
    const complementaryCertificationHabilitation = new ComplementaryCertificationHabilitation({
      complementaryCertificationId: parseInt(complementaryCertificationId),
      certificationCenterId: createdCertificationCenter.id,
    });

    await complementaryCertificationHabilitationRepository.save(complementaryCertificationHabilitation);
  }

  const dataProtectionOfficer = await dataProtectionOfficerRepository.create({
    certificationCenterId: createdCertificationCenter.id,
    firstName: certificationCenter.dataProtectionOfficerFirstName,
    lastName: certificationCenter.dataProtectionOfficerLastName,
    email: certificationCenter.dataProtectionOfficerEmail,
  });

  createdCertificationCenter.dataProtectionOfficerFirstName = dataProtectionOfficer.firstName;
  createdCertificationCenter.dataProtectionOfficerLastName = dataProtectionOfficer.lastName;
  createdCertificationCenter.dataProtectionOfficerEmail = dataProtectionOfficer.email;

  return createdCertificationCenter;
});

async function _getOrganizationStructure({ organizationId, structureRepository }) {
  const organizationStructure = await structureRepository.findByOrganizationId({ organizationId });

  if (!organizationStructure) {
    throw new UnableToAttachCertificationCenterToOrganization({
      code: 'ORGANIZATION_NOT_FOUND',
      message: 'Organization not found',
      meta: { organizationId },
    });
  }

  return organizationStructure;
}

export { createCertificationCenter };
