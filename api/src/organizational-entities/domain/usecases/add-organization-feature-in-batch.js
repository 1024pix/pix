/**
 * @typedef {import ('../usecases/index.js').OrganizationFeatureRepository} OrganizationFeatureRepository
 */

import { createReadStream } from 'node:fs';

import { CsvColumn } from '../../../../lib/infrastructure/serializers/csv/csv-column.js';
import { getDataBuffer } from '../../../prescription/learner-management/infrastructure/utils/bufferize/get-data-buffer.js';
import { CsvParser } from '../../../shared/infrastructure/serializers/csv/csv-parser.js';
import { FeatureParamsNotProcessable } from '../errors.js';
import { OrganizationFeature } from '../models/OrganizationFeature.js';

const organizationFeatureCsvHeader = {
  columns: [
    new CsvColumn({
      property: 'featureId',
      name: 'Feature ID',
      isRequired: true,
    }),
    new CsvColumn({
      property: 'organizationId',
      name: 'Organization ID',
      isRequired: true,
    }),
    new CsvColumn({
      property: 'params',
      name: 'Params',
      isRequired: false,
    }),
  ],
};

/**
 * @param {Object} params - A parameter object.
 * @param {string} params.featureId - feature id to add.
 * @param {string} params.filePath - path of csv file wich contains organizations and params.
 * @param {OrganizationFeatureRepository} params.organizationFeatureRepository - organizationRepository to use.
 * @param {Object} params.dependencies
 * @returns {Promise<void>}
 */
async function addOrganizationFeatureInBatch({ filePath, organizationFeatureRepository }) {
  const stream = createReadStream(filePath);
  const buffer = await getDataBuffer(stream);

  const csvParser = new CsvParser(buffer, organizationFeatureCsvHeader);
  const csvData = csvParser.parse();
  const data = csvData.map(({ featureId, organizationId, params }) => {
    try {
      return new OrganizationFeature({ featureId, organizationId, params: params });
    } catch (err) {
      throw new FeatureParamsNotProcessable();
    }
  });
  return organizationFeatureRepository.saveInBatch(data);
}

export { addOrganizationFeatureInBatch };
