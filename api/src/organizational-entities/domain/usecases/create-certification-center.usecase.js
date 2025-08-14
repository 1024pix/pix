import { ComplementaryCertificationHabilitation } from '../../../shared/domain/models/ComplementaryCertificationHabilitation.js';
import * as injectedCertificationCenterForAdminRepository from '../../infrastructure/repositories/certification-center-for-admin.repository.js';
import * as injectedComplementaryCertificationHabilitationRepository from '../../infrastructure/repositories/complementary-certification-habilitation.repository.js';
import * as injectedDataProtectionOfficerRepository from '../../infrastructure/repositories/data-protection-officer.repository.js';
import * as certificationCenterCreationValidator from '../validators/certification-center-creation.validator.js';

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
  complementaryCertificationHabilitationRepository = injectedComplementaryCertificationHabilitationRepository,
  certificationCenterForAdminRepository = injectedCertificationCenterForAdminRepository,
  dataProtectionOfficerRepository = injectedDataProtectionOfficerRepository,
} = {}) {
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
