const Training = require('../../domain/models/Training');
const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError } = require('../../domain/errors');
const TABLE_NAME = 'trainings';

module.exports = {
  async findByTargetProfileIdAndLocale({ targetProfileId, locale = 'fr-fr' }) {
    const trainingsDTO = await knex(TABLE_NAME)
      .select('trainings.*')
      .join('target-profile-trainings', `${TABLE_NAME}.id`, 'trainingId')
      .where({ targetProfileId })
      .where({ locale })
      .orderBy('trainings.id', 'asc');

    const targetProfileTrainings = await knex('target-profile-trainings').whereIn(
      'trainingId',
      trainingsDTO.map(({ id }) => id)
    );

    return trainingsDTO.map((training) => _toDomain(training, targetProfileTrainings));
  },

  async get(id) {
    const training = await knex(TABLE_NAME).where({ id }).first();
    if (!training) {
      throw new NotFoundError(`Not found training for ID ${id}`);
    }
    return _toDomain(training);
  },
};

function _toDomain(training, targetProfileTrainings) {
  const targetProfileIds = targetProfileTrainings
    .filter(({ trainingId }) => trainingId === training.id)
    .map(({ targetProfileId }) => targetProfileId);

  return new Training({ ...training, targetProfileIds });
}
