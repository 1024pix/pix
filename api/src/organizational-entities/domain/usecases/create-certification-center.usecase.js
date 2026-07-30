import { UnableToAttachCertificationCenterToOrganization } from '../errors.js';
import { ComplementaryCertificationHabilitation } from '../models/ComplementaryCertificationHabilitation.js';
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
 * @param{OrganizationForAdminRepository} params.organizationForAdminRepository
 * @returns {Promise<*>}
 */
const createCertificationCenter = async function ({
  certificationCenter,
  complementaryCertificationIds,
  complementaryCertificationHabilitationRepository,
  certificationCenterForAdminRepository,
  dataProtectionOfficerRepository,
  organizationForAdminRepository,
}) {
  certificationCenterCreationValidator.validate(certificationCenter);

  const { organizationId } = certificationCenter;

  if (organizationId) {
    const isExistingOrganisation = await organizationForAdminRepository.exist({ organizationId });
    if (!isExistingOrganisation) {
      throw new UnableToAttachCertificationCenterToOrganization({
        code: 'ORGANIZATION_NOT_FOUND',
        message: 'Organization not found',
        meta: { organizationId },
      });
    }

    const alreadyAttachedCertificationCenter =
      await certificationCenterForAdminRepository.findAttachedByOrganizationId(organizationId);
    if (alreadyAttachedCertificationCenter.length) {
      throw new UnableToAttachCertificationCenterToOrganization({
        code: 'ALREADY_ATTACHED_ORGANIZATION',
        message: 'Organization already has an attached certification center',
        meta: {
          organizationId,
          alreadyAttachedCertificationCenterId: alreadyAttachedCertificationCenter[0].id,
        },
      });
    }
  }

  const createdCertificationCenter = await certificationCenterForAdminRepository.save(certificationCenter);

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

  if (organizationId) {
    await organizationForAdminRepository.attachCertificationCenter({
      organizationId,
      certificationCenterId: createdCertificationCenter.id,
    });
  }

  return createdCertificationCenter;
};

export { createCertificationCenter };
