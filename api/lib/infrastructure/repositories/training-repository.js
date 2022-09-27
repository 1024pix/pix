const trainingDatasource = require('../datasources/learning-content/training-datasource');
const Training = require('../../domain/models/Training');
const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError } = require('../../domain/errors');
const TABLE_NAME = 'trainings';

module.exports = {
  async findByTargetProfileIdAndLocale({ targetProfileId, locale = 'fr-fr' }) {
    const trainingData = await trainingDatasource.list();
    const trainings = trainingData.filter((training) => {
      const hasTargetProfileId = targetProfileId && training.targetProfileIds?.includes(targetProfileId);
      const hasLocale = locale && training.locale === locale;
      return hasTargetProfileId && hasLocale;
    });
    return trainings.map(_toDomain);
  },

  async get(id) {
    const training = await knex(TABLE_NAME).where({ id }).first();
    if (!training) {
      throw new NotFoundError(`Not found training for ID ${id}`);
    }
    return _toDomain(training);
  },
};

function _toDomain(training) {
  return new Training(training);
}
