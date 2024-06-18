/**
 * @typedef {import("./index.js").CenterRepository} CenterRepository
 * @typedef {import("./index.js").ComplementaryCertificationRepository} ComplementaryCertificationRepository
 * @typedef {import("../models/Center.js").Center} Center
 * @typedef {import("../../../../shared/domain/errors.js").NotFoundError} NotFoundError
 */

/**
 * @param {Object} params
 * @param {number} params.centerId
 * @param {CenterRepository} params.centerRepository
 *
 * @returns {Center} related certification center
 * @throws {NotFoundError} a candidate is linked to an unexisting certification center
 */
const getMassImportTemplateInformation = async ({ centerId, centerRepository }) => {
  const center = await centerRepository.getById({ id: centerId });
  return {
    habilitationLabels: center.habilitations.map((habilitation) => habilitation.label),
    shouldDisplayBillingModeColumns: center.hasBillingMode,
  };
};

export { getMassImportTemplateInformation };
