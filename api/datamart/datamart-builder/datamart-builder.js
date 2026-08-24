import { logger } from '../../src/shared/infrastructure/utils/logger.js';
import { datamartBuffer } from './datamart-buffer.js';
import { factory } from './factory/index.js';

/**
 * @class DatamartBuilder
 * @property {Factory} factory
 */
class DatamartBuilder {
  constructor({ databaseConnection }) {
    this.databaseConnection = databaseConnection;
    this.knex = databaseConnection.knex;
    this.datamartBuffer = datamartBuffer;
    this.factory = factory;
  }

  static async create({ databaseConnection }) {
    return new DatamartBuilder({ databaseConnection });
  }

  async commit() {
    if (!this.databaseConnection.isConfigured) return;

    try {
      const trx = await this.knex.transaction();
      for (const objectToInsert of this.datamartBuffer.objectsToInsert) {
        await trx(objectToInsert.tableName).insert(objectToInsert.values);
      }
      await trx.commit();
    } catch (err) {
      logger.error(`Erreur dans datamartBuilder.commit() : ${err}`);
      throw err;
    } finally {
      this.datamartBuffer.purge();
    }
  }

  async clean() {
    if (!this.databaseConnection.isConfigured) return;

    let rawQuery = '';

    [
      'certification_results',
      'sco_certification_results',
      'organizations_cover_rates',
      'data_active_calibrated_challenges',
      'data_scoring_meshes',
      'data_scoring_meshes_all',
      'data_scoring_thresholds',
      'data_scoring_thresholds_all',
      'data_calibrations',
      'target_profiles_course_duration',
      'men_dashboard_certification_dataset',
      'men_dashboard_participation_dataset',
    ].forEach((tableName) => {
      rawQuery += `DELETE FROM ${tableName};`;
    });

    await this.knex.raw(rawQuery);
  }
}

export { DatamartBuilder };
