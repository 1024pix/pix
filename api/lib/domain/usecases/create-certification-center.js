import ComplementaryCertificationHabilitation from '../models/ComplementaryCertificationHabilitation';
import certificationCenterCreationValidator from '../validators/certification-center-creation-validator';

export default async function createCertificationCenter({
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
}
