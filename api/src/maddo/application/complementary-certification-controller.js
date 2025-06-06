import { usecases } from '../domain/usecases/index.js';

export function getCalibration({ scope, dependencies = { getCalibration: usecases.getCalibration } }) {
  // liste des challenges avec leur calibration
  const calibration = dependencies.getCalibration({ scope });

  return calibration;
}
