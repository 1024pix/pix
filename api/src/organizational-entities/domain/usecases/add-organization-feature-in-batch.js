/**
 * @typedef {import ('../usecases/index.js').OrganizationFeatureRepository} OrganizationFeatureRepository
 */

import { createReadStream } from 'node:fs';

import * as injectedLearnersApi from '../../../prescription/learner-management/application/api/learners-api.js';
import { getDataBuffer } from '../../../prescription/learner-management/infrastructure/utils/bufferize/get-data-buffer.js';
import { withTransaction } from '../../../shared/domain/DomainTransaction.js';
import { CsvParser } from '../../../shared/infrastructure/serializers/csv/csv-parser.js';
import * as injectedOrganizationFeatureRepository from '../../infrastructure/repositories/organization-feature-repository.js';
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
  async ({
    userId,
    filePath,
    organizationFeatureRepository = injectedOrganizationFeatureRepository,
    learnersApi = injectedLearnersApi,
  } = {}) => {
    const stream = createReadStream(filePath);
    const buffer = await getDataBuffer(stream);

    const csvParser = new CsvParser(buffer, ORGANIZATION_FEATURES_HEADER);
    const csvData = csvParser.parse();
    const data = csvData.map(({ featureId, organizationId, params, deleteLearner }) => {
      try {
        return new OrganizationFeature({ featureId, organizationId, params, deleteLearner });
      } catch {
        throw new FeatureParamsNotProcessable();
      }
    });

    data.forEach(async ({ organizationId, deleteLearner }) => {
      if (deleteLearner) {
        await learnersApi.deleteOrganizationLearnerBeforeImportFeature({ userId, organizationId });
      }
    });

    return organizationFeatureRepository.saveInBatch(data);
  },
);
