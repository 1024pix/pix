import { CALIBRATION_SCOPES } from '../../../configuration/domain/models/Calibration.js';

/**
 * Certification scopes
 * @readonly
 * @enum {string}
 */
export const SCOPES = Object.freeze({
  CORE: 'CORE',
  PIX_PLUS_DROIT: 'DROIT',
  PIX_PLUS_EDU_1ER_DEGRE: 'EDU_1ER_DEGRE',
  PIX_PLUS_EDU_2ND_DEGRE: 'EDU_2ND_DEGRE',
  PIX_PLUS_EDU_CPE: 'EDU_CPE',
  PIX_PLUS_PRO_SANTE: 'PRO_SANTE',
});

/**
 * @param {typeof CALIBRATION_SCOPES[keyof typeof CALIBRATION_SCOPES]} calibrationScope
 * @returns {SCOPES}
 */
export function fromCalibrationScope(calibrationScope) {
  const mapping = {
    [CALIBRATION_SCOPES.COEUR]: SCOPES.CORE,
    [CALIBRATION_SCOPES.EDU_1ER_DEGRE]: SCOPES.PIX_PLUS_EDU_1ER_DEGRE,
    [CALIBRATION_SCOPES.EDU_2ND_DEGRE]: SCOPES.PIX_PLUS_EDU_2ND_DEGRE,
    [CALIBRATION_SCOPES.EDU_CPE]: SCOPES.PIX_PLUS_EDU_CPE,
    [CALIBRATION_SCOPES.DROIT]: SCOPES.PIX_PLUS_DROIT,
    [CALIBRATION_SCOPES.PRO_SANTE]: SCOPES.PIX_PLUS_PRO_SANTE,
  };
  return mapping[calibrationScope];
}
