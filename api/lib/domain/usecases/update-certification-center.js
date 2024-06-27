/**
 * @typedef {import('./index.js').CenterRepository} CenterRepository
 */
import bluebird from 'bluebird';

import { CenterForAdminFactory } from '../../../src/certification/enrolment/domain/models/factories/CenterForAdminFactory.js';
import { CertificationCenterPilotFeaturesConflictError } from '../../../src/shared/domain/errors.js';
import { ComplementaryCertificationHabilitation, DataProtectionOfficer } from '../models/index.js';
import * as certificationCenterCreationValidator from '../validators/certification-center-creation-validator.js';

async function _addOrUpdateDataProtectionOfficer({
  certificationCenterId,
  certificationCenterInformation,
  dataProtectionOfficerRepository,
}) {
  const dataProtectionOfficer = new DataProtectionOfficer({
    firstName: certificationCenterInformation.dataProtectionOfficerFirstName ?? '',
    lastName: certificationCenterInformation.dataProtectionOfficerLastName ?? '',
    email: certificationCenterInformation.dataProtectionOfficerEmail ?? '',
    certificationCenterId,
  });

  const dataProtectionOfficerFound = await dataProtectionOfficerRepository.get({
    certificationCenterId,
  });

  if (dataProtectionOfficerFound) return dataProtectionOfficerRepository.update(dataProtectionOfficer);

  return dataProtectionOfficerRepository.create(dataProtectionOfficer);
}

/**
 * @param {Object} params
 * @param {CenterRepository} params.centerRepository
 */
const updateCertificationCenter = async function ({
  certificationCenterId,
  certificationCenterInformation,
  complementaryCertificationIds,
  certificationCenterForAdminRepository,
  complementaryCertificationHabilitationRepository,
  dataProtectionOfficerRepository,
  centerRepository,
}) {
  certificationCenterCreationValidator.validate(certificationCenterInformation);

  const certificationCenter = await centerRepository.getById({
    id: certificationCenterId,
  });

  _verifyCenterPilotFeaturesCompatibility({
    currentCenter: certificationCenter,
    newCenterData: certificationCenterInformation,
  });

  await complementaryCertificationHabilitationRepository.deleteByCertificationCenterId(certificationCenterId);

  if (complementaryCertificationIds) {
    await bluebird.mapSeries(complementaryCertificationIds, (complementaryCertificationId) => {
      const complementaryCertificationHabilitation = new ComplementaryCertificationHabilitation({
        complementaryCertificationId: parseInt(complementaryCertificationId),
        certificationCenterId,
      });
      return complementaryCertificationHabilitationRepository.save(complementaryCertificationHabilitation);
    });
  }

  await certificationCenterForAdminRepository.update(certificationCenterInformation);
  const updatedCertificationCenter = await centerRepository.getById({ id: certificationCenterId });

  const dataProtectionOfficer = await _addOrUpdateDataProtectionOfficer({
    certificationCenterId,
    certificationCenterInformation,
    dataProtectionOfficerRepository,
  });

  return CenterForAdminFactory.fromCenterAndDataProtectionOfficer({
    center: updatedCertificationCenter,
    dataProtectionOfficer,
  });
};

export { updateCertificationCenter };

const _verifyCenterPilotFeaturesCompatibility = ({ currentCenter, newCenterData }) => {
  if (currentCenter.isComplementaryAlonePilot && !newCenterData.isV3Pilot) {
    throw new CertificationCenterPilotFeaturesConflictError();
  }
};
