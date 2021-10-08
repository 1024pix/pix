const GrantedAccreditation = require('../models/GrantedAccreditation');
const certificationCenterCreationValidator = require('../validators/certification-center-creation-validator');

module.exports = async function createCertificationCenter({
  certificationCenter,
  accreditationIds,
  grantedAccreditationRepository,
  certificationCenterRepository,
}) {
  certificationCenterCreationValidator.validate(certificationCenter);
  const createdCertificationCenter = await certificationCenterRepository.save(certificationCenter);

  for (const accreditationId of accreditationIds) {
    const grantedAccreditation = new GrantedAccreditation({
      accreditationId: parseInt(accreditationId),
      certificationCenterId: createdCertificationCenter.id,
    });

    await grantedAccreditationRepository.save(grantedAccreditation);
  }

  return createdCertificationCenter;
};
