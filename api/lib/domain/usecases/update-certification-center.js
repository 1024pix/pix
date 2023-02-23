const bluebird = require('bluebird');
const certificationCenterCreationValidator = require('../validators/certification-center-creation-validator.js');
const ComplementaryCertificationHabilitation = require('../../domain/models/ComplementaryCertificationHabilitation.js');
const DataProtectionOfficer = require('../models/DataProtectionOfficer.js');
const ComplementaryCertification = require('../models/ComplementaryCertification.js');

async function _addOrUpdateDataProtectionOfficer({ certificationCenter, dataProtectionOfficerRepository }) {
  const dataProtectionOfficer = new DataProtectionOfficer({
    firstName: certificationCenter.dataProtectionOfficerFirstName ?? '',
    lastName: certificationCenter.dataProtectionOfficerLastName ?? '',
    email: certificationCenter.dataProtectionOfficerEmail ?? '',
    certificationCenterId: certificationCenter.id,
  });

  const dataProtectionOfficerFound = await dataProtectionOfficerRepository.get({
    certificationCenterId: certificationCenter.id,
  });

  if (dataProtectionOfficerFound) return dataProtectionOfficerRepository.update(dataProtectionOfficer);

  return dataProtectionOfficerRepository.create(dataProtectionOfficer);
}

module.exports = async function updateCertificationCenter({
  certificationCenter,
  complementaryCertificationIds,
  certificationCenterForAdminRepository,
  complementaryCertificationHabilitationRepository,
  dataProtectionOfficerRepository,
}) {
  certificationCenterCreationValidator.validate(certificationCenter);

  if (certificationCenter.id) {
    await complementaryCertificationHabilitationRepository.deleteByCertificationCenterId(certificationCenter.id);
  }

  if (complementaryCertificationIds) {
    await bluebird.mapSeries(complementaryCertificationIds, (complementaryCertificationId) => {
      const complementaryCertificationHabilitation = new ComplementaryCertificationHabilitation({
        complementaryCertificationId: parseInt(complementaryCertificationId),
        certificationCenterId: certificationCenter.id,
      });
      return complementaryCertificationHabilitationRepository.save(complementaryCertificationHabilitation);
    });
  }

  const updatedCertificationCenter = await certificationCenterForAdminRepository.update(certificationCenter);

  const habilitations = await complementaryCertificationHabilitationRepository.findByCertificationCenterId(
    updatedCertificationCenter.id
  );
  updatedCertificationCenter.habilitations = habilitations.map((habilitation) => {
    return new ComplementaryCertification({
      id: habilitation.id,
      key: habilitation.key,
      label: habilitation.label,
    });
  });

  const dataProtectionOfficer = await _addOrUpdateDataProtectionOfficer({
    dataProtectionOfficerRepository,
    certificationCenter,
  });
  updatedCertificationCenter.dataProtectionOfficerFirstName = dataProtectionOfficer.firstName;
  updatedCertificationCenter.dataProtectionOfficerLastName = dataProtectionOfficer.lastName;
  updatedCertificationCenter.dataProtectionOfficerEmail = dataProtectionOfficer.email;

  return updatedCertificationCenter;
};
