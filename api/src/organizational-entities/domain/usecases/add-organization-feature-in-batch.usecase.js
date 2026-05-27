/**
 * @typedef {import ('./index.js').OrganizationFeatureRepository} OrganizationFeatureRepository
 */

import { createReadStream } from 'node:fs';

import { getDataBuffer } from '../../../prescription/learner-management/infrastructure/utils/bufferize/get-data-buffer.js';
import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { EntityValidationError } from '../../../shared/domain/errors.js';
import { CsvParser } from '../../../shared/infrastructure/serializers/csv/csv-parser.js';
import { ORGANIZATION_FEATURES_HEADER } from '../constants.js';
import { FeatureParamsNotProcessable } from '../errors.js';
import { OrganizationFeature } from '../models/OrganizationFeature.js';

export const addOrganizationFeatureInBatch = withTransaction(
  /**
   * @param {Object} params - A parameter object.
   * @param {Number} params.userId - user connected performing the action
   * @param {string} params.filePath - path of csv file wich contains organizations and params.
   * @param {OrganizationFeatureRepository} params.organizationFeatureRepository - organizationRepository to use.
   * @param {Object} params.dependencies
   * @returns {Promise<void>}
   */
  async ({ userId, filePath, organizationFeatureRepository, featureRepository, learnersApi }) => {
    const stream = createReadStream(filePath);
    const buffer = await getDataBuffer(stream);

    const features = await featureRepository.findAll();
    const csvParser = new CsvParser(buffer, ORGANIZATION_FEATURES_HEADER);
    const csvData = csvParser.parse();
    const data = csvData.map(({ featureName, organizationId, params, deleteLearner }) => {
      try {
        return new OrganizationFeature({
          featureName,
          organizationId: parseInt(organizationId, 10),
          params: params ? JSON.parse(params) : null,
          deleteLearner: deleteLearner === 'Y',
          features,
        });
      } catch (error) {
        if (error instanceof EntityValidationError) throw error;
        throw new FeatureParamsNotProcessable();
      }
    });

    for (const learner of data) {
      if (learner.deleteLearner) {
        await learnersApi.deleteOrganizationLearnerBeforeImportFeature({
          userId,
          organizationId: learner.organizationId,
        });
      }
    }

    return organizationFeatureRepository.saveInBatch(data);
  },
);
