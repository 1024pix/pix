import { datamartBuffer } from '../datamart-buffer.js';

const buildScoringThreshold = function ({
  scoringThresholdsAllId,
  competenceId,
  level = 0,
  minBoundCuratedValue = -8,
  maxBoundCuratedValue = -2,
} = {}) {
  const values = {
    scoring_thresholds_all_id: scoringThresholdsAllId,
    level,
    competence_id: competenceId,
    min_bound_curated_value: minBoundCuratedValue,
    max_bound_curated_value: maxBoundCuratedValue,
  };

  return datamartBuffer.pushInsertable({
    tableName: 'data_scoring_thresholds',
    values,
  });
};

export { buildScoringThreshold };
