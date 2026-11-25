import { buildCalibration } from './build-calibration.js';
import { buildCertificationResult } from './build-certification-result.js';
import { buildDatamartActiveCalibratedChallenge } from './build-datamart-active-calibrated-challenges.js';
import { buildMenDashboardCertificationDataset } from './build-men-dashboard-certification-dataset.js';
import { buildMenDashboardParticipationDataset } from './build-men-dashboard-participation-dataset.js';
import { buildOrganizationsCoverRates } from './build-organizations-cover-rates.js';
import { buildReplicationMetadata } from './build-replication-metadata.js';
import { buildScoCertificationResult } from './build-sco-certification-result.js';
import { buildScoringMesh } from './build-scoring-mesh.js';
import { buildScoringMeshesAll } from './build-scoring-meshes-all.js';
import { buildScoringThreshold } from './build-scoring-threshold.js';
import { buildScoringThresholdsAll } from './build-scoring-thresholds-all.js';
import { buildTargetProfileCourseDuration } from './build-target-profile-course-duration.js';

export const factory = {
  buildCalibration,
  buildCertificationResult,
  buildDatamartActiveCalibratedChallenge,
  buildMenDashboardCertificationDataset,
  buildMenDashboardParticipationDataset,
  buildOrganizationsCoverRates,
  buildReplicationMetadata,
  buildScoCertificationResult,
  buildScoringMesh,
  buildScoringMeshesAll,
  buildScoringThreshold,
  buildScoringThresholdsAll,
  buildTargetProfileCourseDuration,
};
