/**
 * @typedef {import("./index.js").CenterRepository} CenterRepository
 * @typedef {import("./index.js").ComplementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {import("../models/Center.js").Center} Center
 * @typedef {import("../../../../shared/domain/errors.js").NotFoundError} NotFoundError
 */

import bluebird from 'bluebird';

/**
 * @param {Object} params
 * @param {number} params.centerId
 * @param {CenterRepository} params.centerRepository
 * @param {ComplementaryCertificationRepository} params.complementaryCertificationRepository
 *
 * @returns {Center} related certification center
 * @throws {NotFoundError} a candidate is linked to an unexisting certification center
 */
const getMassImportTemplateInformation = async ({
  centerId,
  centerRepository,
  complementaryCertificationRepository,
}) => {
  const center = await centerRepository.getById({ id: centerId });
  const habilitationLabels = await _getCenterHabilitationsLabels({ center, complementaryCertificationRepository });
  return {
    habilitationLabels,
    shouldDisplayBillingModeColumns: center.hasBillingMode,
  };
};

export { getMassImportTemplateInformation };

/**
 * @param {Object} params
 * @param {ComplementaryCertificationRepository} params.complementaryCertificationRepository
 */
const _getCenterHabilitationsLabels = async ({ center, complementaryCertificationRepository }) => {
  return bluebird.mapSeries(center.habilitations, async (complementaryCertificationId) => {
    const complementary = await complementaryCertificationRepository.getById({ complementaryCertificationId });
    return complementary.label;
  });
};
