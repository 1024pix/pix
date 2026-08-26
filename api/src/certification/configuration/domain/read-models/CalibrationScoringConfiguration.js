/**
 * @typedef {import('../models/Calibration.js').Calibration} Calibration
 * @typedef {import('../models/Calibration.js').CalibrationScoringMesh} CalibrationScoringMesh
 */

export class CalibrationScoringConfiguration {
  /**
   * @param {object} params
   * @param {number} params.calibrationId
   * @param {Array<{meshLevel: number, bounds: {min: number, max: number}}>} params.globalScoringConfiguration
   */
  constructor({ calibrationId, globalScoringConfiguration, competencesScoringConfiguration }) {
    this.calibrationId = calibrationId;
    this.globalScoringConfiguration = globalScoringConfiguration;
    this.competencesScoringConfiguration = competencesScoringConfiguration;
  }

  /**
   * @param {object} params
   * @param {Calibration} params.calibration
   * @returns {CalibrationScoringConfiguration}
   */
  static fromCalibration({ calibration }) {
    return new CalibrationScoringConfiguration({
      calibrationId: calibration.id,
      globalScoringConfiguration: calibration.scoringMeshes.map(_toMeshLevelBounds),
      competencesScoringConfiguration: _groupThresholdsByCompetence(calibration.scoringThresholds),
    });
  }
}

/**
 * @param {CalibrationScoringMesh} calibrationScoringMesh
 */
function _toMeshLevelBounds({ mesh, minBoundCuratedValue, maxBoundCuratedValue }) {
  return {
    meshLevel: mesh,
    bounds: {
      min: minBoundCuratedValue,
      max: maxBoundCuratedValue,
    },
  };
}

function _groupThresholdsByCompetence(scoringThresholds) {
  const map = new Map();
  for (const { competenceId, level, minBoundCuratedValue, maxBoundCuratedValue } of scoringThresholds) {
    if (!map.has(competenceId)) map.set(competenceId, []);
    map
      .get(competenceId)
      .push({ competenceLevel: level, bounds: { min: minBoundCuratedValue, max: maxBoundCuratedValue } });
  }
  return Array.from(map, ([competenceId, values]) => ({ competenceId, values }));
}
