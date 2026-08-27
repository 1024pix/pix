/**
 * @typedef {import('./Version.js').Version} Version
 * @typedef {import('./Calibration.js').CalibrationForReport} CalibrationForReport
 */
import { SCOPES } from '../../../shared/domain/models/Scopes.js';
import { CALIBRATION_STATUSES, fromCalibrationScope } from './Calibration.js';

export class CalibrationReport {
  constructor({ versionId, calibrationId, generatedAt, reportLines }) {
    this.versionId = versionId;
    this.calibrationId = calibrationId;
    this.generatedAt = generatedAt;
    this.reportLines = reportLines;
  }
}

export class CalibrationReportLine {
  constructor({ label, content, alertLevel = null, additionalContent = null }) {
    this.label = label;
    this.content = content;
    this.alertLevel = alertLevel;
    this.additionalContent = additionalContent;
  }
}

export const REPORT_LABELS = Object.freeze({
  CALIBRATED_CHALLENGE_COUNT: 'CALIBRATED_CHALLENGE_COUNT',
  TUBE_ONLY_IN_VERSION_COUNT: 'TUBE_ONLY_IN_VERSION_COUNT',
  TUBE_ONLY_IN_CALIBRATION_COUNT: 'TUBE_ONLY_IN_CALIBRATION_COUNT',
  CALIBRATION_STARTED_AT: 'CALIBRATION_STARTED_AT',
  CALIBRATION_STATUS: 'CALIBRATION_STATUS',
  CALIBRATION_SCOPE: 'CALIBRATION_SCOPE',
  MESH_SCORING_PRESENCE: 'MESH_SCORING_PRESENCE',
  COMPETENCE_SCORING_PRESENCE: 'COMPETENCE_SCORING_PRESENCE',
});

export const ALERT_LEVELS = Object.freeze({
  HIGH: 'HIGH',
  LOW: 'LOW',
});

/**
 *
 * @param {object} params
 * @param {Version} params.version
 * @param {CalibrationForReport} params.calibration
 * @returns CalibrationReport
 */
export function buildReport({ version, calibration }) {
  const now = new Date();
  const reportLines = [];
  computeReportForLearningContentPerimeter(version, calibration, reportLines);
  computeReportForStartDate(now, calibration, reportLines);
  computeReportForScope(calibration, reportLines);
  computeReportForStatus(calibration, reportLines);
  computeReportForMeshScoring(version, calibration, reportLines);
  computeReportForCompetenceScoring(version, calibration, reportLines);
  return new CalibrationReport({
    versionId: version.id,
    calibrationId: calibration.id,
    generatedAt: now,
    reportLines,
  });
}

function computeReportForLearningContentPerimeter(version, calibration, reportLines) {
  reportLines.push(
    new CalibrationReportLine({ label: REPORT_LABELS.CALIBRATED_CHALLENGE_COUNT, content: calibration.challengeCount }),
  );
  const tubeIdsFromCalibration = calibration.tubeIds;
  const tubeIdsFromVersion = new Set(version.tubeIds);
  const tubeIdsNotInBoth = tubeIdsFromCalibration.symmetricDifference(tubeIdsFromVersion);
  if (tubeIdsNotInBoth.size > 0) {
    const tubeIdsInCalibrationButNotInVersion = tubeIdsNotInBoth.intersection(tubeIdsFromCalibration);
    if (tubeIdsInCalibrationButNotInVersion.size) {
      reportLines.push(
        new CalibrationReportLine({
          label: REPORT_LABELS.TUBE_ONLY_IN_CALIBRATION_COUNT,
          content: tubeIdsInCalibrationButNotInVersion.size,
          alertLevel: ALERT_LEVELS.HIGH,
          additionalContent: [...tubeIdsInCalibrationButNotInVersion.values()].join(', '),
        }),
      );
    }
    const tubeIdsInVersionButNotInCalibration = tubeIdsNotInBoth.intersection(tubeIdsFromVersion);
    if (tubeIdsInVersionButNotInCalibration.size) {
      reportLines.push(
        new CalibrationReportLine({
          label: REPORT_LABELS.TUBE_ONLY_IN_VERSION_COUNT,
          content: tubeIdsInVersionButNotInCalibration.size,
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
  let alertLevel, additionalContent;
  if (calibration.startedAt >= sixMonthsAgo) {
    alertLevel = null;
  } else if (calibration.startedAt >= oneYearAgo) {
    alertLevel = ALERT_LEVELS.LOW;
    additionalContent = 'La calibration a été démarrée depuis plus de 6 mois';
  } else {
    alertLevel = ALERT_LEVELS.HIGH;
    additionalContent = "La calibration a été démarrée depuis plus d'1 an";
  }
  reportLines.push(
    new CalibrationReportLine({
      label: REPORT_LABELS.CALIBRATION_STARTED_AT,
      content: calibration.startedAt,
      alertLevel,
      additionalContent,
    }),
  );
}

function computeReportForScope(calibration, reportLines) {
  reportLines.push(
    new CalibrationReportLine({
      label: REPORT_LABELS.CALIBRATION_SCOPE,
      content: fromCalibrationScope(calibration.scope),
    }),
  );
}

function computeReportForStatus(calibration, reportLines) {
  const alertLevel = calibration.status === CALIBRATION_STATUSES.VALIDATED ? null : ALERT_LEVELS.HIGH;
  const additionalContent = alertLevel === null ? null : 'La calibration ne semble pas encore finalisée';
  reportLines.push(
    new CalibrationReportLine({
      label: REPORT_LABELS.CALIBRATION_STATUS,
      content: calibration.status,
      alertLevel,
      additionalContent,
    }),
  );
}

function computeReportForMeshScoring(version, calibration, reportLines) {
  let alertLevel = null;
  let additionalContent = null;
  if (!calibration.hasMeshScoring) {
    alertLevel = version.scope === SCOPES.CORE ? ALERT_LEVELS.HIGH : ALERT_LEVELS.LOW;
    additionalContent = 'Aucun scoring par maille validé trouvé pour cette calibration';
  }
  reportLines.push(
    new CalibrationReportLine({
      label: REPORT_LABELS.MESH_SCORING_PRESENCE,
      content: calibration.hasMeshScoring,
      alertLevel,
      additionalContent,
    }),
  );
}

function computeReportForCompetenceScoring(version, calibration, reportLines) {
  let alertLevel = null;
  let additionalContent = null;
  if (!calibration.hasCompetenceScoring && version.scope === SCOPES.CORE) {
    alertLevel = ALERT_LEVELS.HIGH;
    additionalContent = 'Aucun scoring par compétence validé trouvé pour cette calibration';
  }
  reportLines.push(
    new CalibrationReportLine({
      label: REPORT_LABELS.COMPETENCE_SCORING_PRESENCE,
      content: calibration.hasCompetenceScoring,
      alertLevel,
      additionalContent,
    }),
  );
}
