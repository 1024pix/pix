const { knex } = require('../../../db/knex-database-connection');

class SettingsRepository {
  constructor(table) {
    this.table = table;
  }

  async isScheduled() {
    const result = await knex
      .select('isScheduled')
      .from('bigint-migration-settings')
      .where('table', this.table)
      .first();
    if (!result) {
      throw new Error(`No settings found in bigint-migration-settings for table ${this.table}`);
    }
    return result.isScheduled;
  }

  async pauseInterval() {
    const result = await knex
      .select('pauseMilliseconds')
      .from('bigint-migration-settings')
      .where('table', this.table)
      .first();
    if (!result) {
      throw new Error('No settings found in bigint-migration-settings');
    }
    return result.pauseMilliseconds;
  }

  async migrationInterval() {
    const result = await knex
      .select('startAt', 'endAt')
      .from('bigint-migration-settings')
      .where('table', this.table)
      .first();
    return {
      startAt: result.startAt,
      endAt: result.endAt,
    };
  }

  async chunkSize() {
    const result = await knex.select('chunkSize').from('bigint-migration-settings').where('table', this.table).first();
    return result.chunkSize;
  }

  async markRowsAsMigrated(id) {
    await knex.from('bigint-migration-settings').where('table', this.table).update('startAt', id);
  }
}

module.exports = SettingsRepository;
