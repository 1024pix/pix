import { datamartBuffer } from '../datamart-buffer.js';

const buildScoringMesh = function ({
  scoringMeshesAllId,
  mesh = 0,
  minBoundCuratedValue = -4.67,
  maxBoundCuratedValue = -1.4,
} = {}) {
  const values = {
    scoring_meshes_all_id: scoringMeshesAllId,
    mesh,
    min_bound_curated_value: minBoundCuratedValue,
    max_bound_curated_value: maxBoundCuratedValue,
  };

  return datamartBuffer.pushInsertable({
    tableName: 'data_scoring_meshes',
    values,
  });
};

export { buildScoringMesh };
