import { datamartBuffer } from './datamart-buffer.js';
import { factory } from './factory/index.js';

/**
 * @class DatamartBuilder
 * @property {Factory} factory
 */
class DatamartBuilder {
  constructor({ knex }) {
    this.knex = knex;
    this.datamartBuffer = datamartBuffer;
    this.factory = factory;
  }

  static async create({ knex }) {
    const datamartBuilder = new DatamartBuilder({ knex });

    try {
      await datamartBuilder._init();
    } catch {
      // Error thrown only with unit tests
    }

    return datamartBuilder;
  }

  async commit() {
    try {
      const trx = await this.knex.transaction();
      for (const objectToInsert of this.datamartBuffer.objectsToInsert) {
        await trx(objectToInsert.tableName).insert(objectToInsert.values);
      }
      await trx.commit();
    } catch (err) {
      // eslint-disable-next-line no-console
      console.error(`Erreur dans datamartBuilder.commit() : ${err}`);
      throw err;
    } finally {
      this.datamartBuffer.purge();
    }
  }

  async clean() {
    let rawQuery = '';

    [
      'certification_results',
      'sco_certification_results',
      'organizations_cover_rates',
      'active_calibrated_challenges',
    ].forEach((tableName) => {
      rawQuery += `DELETE FROM ${tableName};`;
    });

    try {
      await this.knex.raw(rawQuery);
    } catch {
      // ignore error
    }
  }
}

export { DatamartBuilder };
