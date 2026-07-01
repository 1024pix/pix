import { ORGANIZATION_FEATURE } from '../../../src/shared/constants.js';
import { databaseBuffer } from '../database-buffer.js';
import { buildOrganizationLearnerImportFormat } from './build-organization-learner-import-format.js';

const buildFeature = function buildFeature({ id = databaseBuffer.getNextId(), key, description } = {}) {
  const values = { id, key, description };

  return databaseBuffer.pushInsertable({ tableName: 'features', values });
};

buildFeature.pixJuniorFeatures = function buildPixJuniorFeatures() {
  const features = [
    ORGANIZATION_FEATURE.LEARNER_IMPORT,
    ORGANIZATION_FEATURE.MISSIONS_MANAGEMENT,
    ORGANIZATION_FEATURE.ORALIZATION_MANAGED_BY_PRESCRIBER,
  ].map(({ key, description }) => {
    const values = { id: databaseBuffer.getNextId(), key, description };
    databaseBuffer.pushInsertable({ tableName: 'features', values });
  });

  buildOrganizationLearnerImportFormat({ name: ORGANIZATION_FEATURE.LEARNER_IMPORT.FORMAT.ONDE });

  return features;
};

export { buildFeature };
