/**
 * @typedef {import('./index.js').CenterRepository} CenterRepository
 * @typedef {import('./index.js').CertificationCenterForAdminRepository} CertificationCenterForAdminRepository
 * @typedef {import('./index.js').ComplementaryCertificationHabilitationRepository} ComplementaryCertificationHabilitationRepository
 * @typedef {import('./index.js').DataProtectionOfficerRepository} DataProtectionOfficerRepository
 */
import bluebird from 'bluebird';

import { CenterForAdminFactory } from '../../../src/certification/enrolment/domain/models/factories/CenterForAdminFactory.js';
import { CertificationCenterPilotFeaturesConflictError } from '../../../src/shared/domain/errors.js';
import {
  ComplementaryCertificationHabilitation,
  DataProtectionOfficer,
} from '../../../src/shared/domain/models/index.js';
import { withTransaction } from '../../infrastructure/DomainTransaction.js';
import * as certificationCenterCreationValidator from '../validators/certification-center-creation-validator.js';

/**
 * @param {Object} params
 * @param {number} params.certificationCenterId
 * @param {Object} params.certificationCenterInformation - see deserializer
 * @param {Array<number>} params.complementaryCertificationIds
 * @param {CenterRepository} params.centerRepository
 * @param {CertificationCenterForAdminRepository} params.certificationCenterForAdminRepository
 * @param {ComplementaryCertificationHabilitationRepository} params.ComplementaryCertificationHabilitationRepository
 * @param {DataProtectionOfficerRepository} params.dataProtectionOfficerRepository
 */
const updateCertificationCenter = async function ({
  certificationCenterId,
  certificationCenterInformation,
  complementaryCertificationIds,
  centerRepository,
  certificationCenterForAdminRepository,
  complementaryCertificationHabilitationRepository,
  dataProtectionOfficerRepository,
}) {
  certificationCenterCreationValidator.validate(certificationCenterInformation);

  await _updateCenter({
    certificationCenterId,
    certificationCenterInformation,
    complementaryCertificationIds,
    centerRepository,
    certificationCenterForAdminRepository,
    complementaryCertificationHabilitationRepository,
  });

  const dataProtectionOfficer = await _addOrUpdateDataProtectionOfficer({
    certificationCenterId,
    certificationCenterInformation,
    dataProtectionOfficerRepository,
  });

  const updatedCertificationCenter = await centerRepository.getById({ id: certificationCenterId });
  return CenterForAdminFactory.fromCenterAndDataProtectionOfficer({
    center: updatedCertificationCenter,
    dataProtectionOfficer,
  });
};

export { updateCertificationCenter };

const _updateCenter = withTransaction(
  /**
   * @param {Object} params
   * @param {CenterRepository} params.centerRepository
   * @param {CertificationCenterForAdminRepository} params.certificationCenterForAdminRepository
   * @param {ComplementaryCertificationHabilitationRepository} params.complementaryCertificationHabilitationRepository
   */
  async ({
    certificationCenterInformation,
    certificationCenterId,
    complementaryCertificationIds,
    centerRepository,
    certificationCenterForAdminRepository,
    complementaryCertificationHabilitationRepository,
  }) => {
    const certificationCenter = await centerRepository.getById({
      id: certificationCenterId,
    });

    _verifyCenterPilotFeaturesCompatibility({
      currentCenter: certificationCenter,
      newCenterData: certificationCenterInformation,
    });

    await certificationCenterForAdminRepository.update(certificationCenterInformation);

    await _updateHabilitations({
      certificationCenterId,
      complementaryCertificationIds,
      complementaryCertificationHabilitationRepository,
    });
  },
  { isolationLevel: 'repeatable read' },
);

const _verifyCenterPilotFeaturesCompatibility = ({ currentCenter, newCenterData }) => {
  if (currentCenter.isComplementaryAlonePilot && !newCenterData.isV3Pilot) {
    throw new CertificationCenterPilotFeaturesConflictError();
  }
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
    await bluebird.mapSeries(complementaryCertificationIds, (complementaryCertificationId) => {
      const complementaryCertificationHabilitation = new ComplementaryCertificationHabilitation({
        complementaryCertificationId: parseInt(complementaryCertificationId),
        certificationCenterId,
      });
      return complementaryCertificationHabilitationRepository.save(complementaryCertificationHabilitation);
    });
  }
};

const _addOrUpdateDataProtectionOfficer = withTransaction(
  /**
   * @param {Object} params
   * @param {DataProtectionOfficerRepository} params.dataProtectionOfficerRepository
   */
  async ({ certificationCenterId, certificationCenterInformation, dataProtectionOfficerRepository }) => {
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
  },
  { isolationLevel: 'repeatable read' },
);
