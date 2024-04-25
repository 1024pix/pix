import bluebird from 'bluebird';

import { V3PilotNotAuthorizedForCertificationCenterError } from '../../../src/shared/domain/errors.js';
import {
  ComplementaryCertification,
  ComplementaryCertificationHabilitation,
  DataProtectionOfficer,
} from '../models/index.js';
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

  if (certificationCenterInformation.isV3Pilot && certificationCenter.isComplementaryAlonePilot) {
    throw new V3PilotNotAuthorizedForCertificationCenterError();
  }

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

  const updatedCertificationCenter = await certificationCenterForAdminRepository.update(certificationCenterInformation);

  const habilitations = await complementaryCertificationHabilitationRepository.findByCertificationCenterId(
    updatedCertificationCenter.id,
  );
  updatedCertificationCenter.habilitations = habilitations.map((habilitation) => {
    return new ComplementaryCertification({
      id: habilitation.id,
      key: habilitation.key,
      label: habilitation.label,
    });
  });

  const dataProtectionOfficer = await _addOrUpdateDataProtectionOfficer({
    certificationCenterId,
    certificationCenterInformation,
    dataProtectionOfficerRepository,
  });
  updatedCertificationCenter.dataProtectionOfficerFirstName = dataProtectionOfficer.firstName;
  updatedCertificationCenter.dataProtectionOfficerLastName = dataProtectionOfficer.lastName;
  updatedCertificationCenter.dataProtectionOfficerEmail = dataProtectionOfficer.email;

  return updatedCertificationCenter;
};

export { updateCertificationCenter };
