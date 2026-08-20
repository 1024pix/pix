import { datamartBuffer } from '../datamart-buffer.js';

const buildScoringMeshesAll = function ({
  id = datamartBuffer.getNextId(),
  calibrationId,
  status = 'TO_VALIDATE',
} = {}) {
  const values = {
    id,
    calibration_id: calibrationId,
    status,
  };

  return datamartBuffer.pushInsertable({
    tableName: 'data_scoring_meshes_all',
    values,
  });
};

export { buildScoringMeshesAll };
