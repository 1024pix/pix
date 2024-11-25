import * as certificationCenterCreationValidator from '../../../../lib/domain/validators/certification-center-creation-validator.js';
import { ComplementaryCertificationHabilitation } from '../../../shared/domain/models/ComplementaryCertificationHabilitation.js';

/**
 *
 * @param{object} params
 * @param{CertificationCenter} params.certificationCenter
 * @param{string[]} params.complementaryCertificationIds
 * @param{ComplementaryCertificationHabilitationRepository} params.complementaryCertificationHabilitationRepository
 * @param{CertificationCenterForAdminRepository} params.certificationCenterForAdminRepository
 * @param{DataProtectionOfficerRepository} params.dataProtectionOfficerRepository
 * @returns {Promise<*>}
 */
const createCertificationCenter = async function ({
  certificationCenter,
  complementaryCertificationIds,
  complementaryCertificationHabilitationRepository,
  certificationCenterForAdminRepository,
  dataProtectionOfficerRepository,
}) {
  certificationCenterCreationValidator.validate(certificationCenter);
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

  return createdCertificationCenter;
};

export { createCertificationCenter };
