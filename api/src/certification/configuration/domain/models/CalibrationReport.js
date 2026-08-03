/**
 * @typedef {import('./Version.js').Version} Version
 * @typedef {import('./Calibration.js').Calibration} Calibration
 */
import { fromCalibrationScope } from '../../../shared/domain/models/Scopes.js';
import { CALIBRATION_STATUSES } from './Calibration.js';

export class CalibrationReport {
  constructor({ versionId, calibrationId, generatedAt, reportLines }) {
    this.versionId = versionId;
    this.calibrationId = calibrationId;
    this.generatedAt = generatedAt;
    this.reportLines = reportLines;
  }
}

export class CalibrationReportLine {
  constructor({ content, alertLevel = ALERT_LEVELS.NA, additionalContent = null }) {
    this.content = content;
    this.alertLevel = alertLevel;
    this.additionalContent = additionalContent;
  }
}

export const ALERT_LEVELS = Object.freeze({
  NA: 'N/A',
  HIGH: 'HIGH',
  LOW: 'LOW',
});

/**
 *
 * @param {object} params
 * @param {Version} params.version
 * @param {Calibration} params.calibration
 * @returns CalibrationReport
 */
export function buildReport({ version, calibration }) {
  const now = new Date();
  const reportLines = [];
  computeReportForLearningContentPerimeter(version, calibration, reportLines);
  computeReportForStartDate(now, calibration, reportLines);
  computeReportForScope(version, calibration, reportLines);
  computeReportForStatus(calibration, reportLines);
  return new CalibrationReport({
    versionId: version.id,
    calibrationId: calibration.id,
    generatedAt: now,
    reportLines,
  });
}

function computeReportForLearningContentPerimeter(version, calibration, reportLines) {
  reportLines.push(
    new CalibrationReportLine({ content: `Nombre d'épreuves calibrées : ${calibration.challengeCount}` }),
  );
  const tubeIdsFromCalibration = calibration.tubeIds;
  const tubeIdsFromVersion = new Set(version.tubeIds);
  const tubeIdsNotInBoth = tubeIdsFromCalibration.symmetricDifference(tubeIdsFromVersion);
  if (tubeIdsNotInBoth.size > 0) {
    const tubeIdsInCalibrationButNotInVersion = tubeIdsNotInBoth.intersection(tubeIdsFromCalibration);
    if (tubeIdsInCalibrationButNotInVersion.size) {
      reportLines.push(
        new CalibrationReportLine({
          content: `Nombre de sujets dans la calibration non présents dans la version : ${tubeIdsInCalibrationButNotInVersion.size}`,
          alertLevel: ALERT_LEVELS.HIGH,
          additionalContent: [...tubeIdsInCalibrationButNotInVersion.values()].join(', '),
        }),
      );
    }
    const tubeIdsInVersionButNotInCalibration = tubeIdsNotInBoth.intersection(tubeIdsFromVersion);
    if (tubeIdsInVersionButNotInCalibration.size) {
      reportLines.push(
        new CalibrationReportLine({
          content: `Nombre de sujets dans la version non présents dans la calibration : ${tubeIdsInVersionButNotInCalibration.size}`,
          alertLevel: ALERT_LEVELS.LOW,
          additionalContent: [...tubeIdsInVersionButNotInCalibration.values()].join(', '),
        }),
      );
    }
  }
}

function computeReportForStartDate(now, calibration, reportLines) {
  const sixMonthsAgo = new Date(now);
  sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
  let alertLevel;
  if (calibration.startedAt >= sixMonthsAgo) {
    alertLevel = ALERT_LEVELS.NA;
  } else if (calibration.startedAt >= oneYearAgo) {
    alertLevel = ALERT_LEVELS.LOW;
  } else {
    alertLevel = ALERT_LEVELS.HIGH;
  }
  reportLines.push(
    new CalibrationReportLine({
      content: `L'élaboration de cette calibration a débuté le ${calibration.startedAt.toLocaleDateString('fr-FR')}`,
      alertLevel,
    }),
  );
}

function computeReportForScope(version, calibration, reportLines) {
  const adaptedCalibrationScope = fromCalibrationScope(calibration.scope);
  const alertLevel = version.scope !== adaptedCalibrationScope ? ALERT_LEVELS.HIGH : ALERT_LEVELS.NA;
  reportLines.push(
    new CalibrationReportLine({
      content: `Le scope de cette calibration est "${adaptedCalibrationScope}"`,
      alertLevel,
    }),
  );
}

function computeReportForStatus(calibration, reportLines) {
  const alertLevel = calibration.status === CALIBRATION_STATUSES.VALIDATED ? ALERT_LEVELS.NA : ALERT_LEVELS.HIGH;
  reportLines.push(
    new CalibrationReportLine({
      content: `Le statut de cette calibration est "${calibration.status}"`,
      alertLevel,
    }),
  );
}
