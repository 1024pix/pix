const Training = require('../../domain/models/Training');
const TrainingSummary = require('../../domain/read-models/TrainingSummary');
const { knex } = require('../../../db/knex-database-connection');
const { NotFoundError } = require('../../domain/errors');
const DomainTransaction = require('../DomainTransaction');
const UserRecommendedTraining = require('../../domain/read-models/UserRecommendedTraining');
const { fetchPage } = require('../utils/knex-utils');
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

    const targetProfileTrainings = await knex('target-profile-trainings').where('trainingId', training.id);

    return _toDomain(training, targetProfileTrainings);
  },

  async findPaginatedSummaries({ page, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction?.knexTransaction || knex;
    const query = knexConn(TABLE_NAME).select('trainings.*').orderBy('id', 'asc');
    const { results, pagination } = await fetchPage(query, page);

    const trainings = results.map((training) => new TrainingSummary(training));
    return { trainings, pagination };
  },

  async findByCampaignParticipationIdAndLocale({
    campaignParticipationId,
    locale,
    domainTransaction = DomainTransaction.emptyTransaction(),
  }) {
    const knexConn = domainTransaction?.knexTransaction || knex;
    const trainingsDTO = await knexConn(TABLE_NAME)
      .select('trainings.*')
      .join('target-profile-trainings', `${TABLE_NAME}.id`, 'trainingId')
      .join('campaigns', 'campaigns.targetProfileId', 'target-profile-trainings.targetProfileId')
      .join('campaign-participations', 'campaign-participations.campaignId', 'campaigns.id')
      .where({ 'campaign-participations.id': campaignParticipationId })
      .where({ locale })
      .orderBy('trainings.id', 'asc');

    const targetProfileTrainings = await knexConn('target-profile-trainings').whereIn(
      'trainingId',
      trainingsDTO.map(({ id }) => id)
    );

    return trainingsDTO.map((training) => _toDomain(training, targetProfileTrainings));
  },

  async update({ id, attributesToUpdate, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction?.knexTransaction || knex;
    const [updatedTraining] = await knexConn(TABLE_NAME)
      .where({ id })
      .update({ ...attributesToUpdate, updatedAt: new Date() })
      .returning('*');

    const targetProfileTrainings = await knexConn('target-profile-trainings').where({ trainingId: id });

    return _toDomain(updatedTraining, targetProfileTrainings);
  },

  async findPaginatedByUserId({ userId, locale, page, domainTransaction = DomainTransaction.emptyTransaction() }) {
    const knexConn = domainTransaction?.knexTransaction || knex;
    const query = knexConn(TABLE_NAME)
      .select('trainings.*')
      .distinct('trainings.id')
      .join('user-recommended-trainings', 'trainings.id', 'trainingId')
      .where({ userId, locale })
      .orderBy('id', 'asc');
    const { results, pagination } = await fetchPage(query, page);

    const userRecommendedTrainings = results.map(
      (userRecommendedTraining) => new UserRecommendedTraining(userRecommendedTraining)
    );
    return { userRecommendedTrainings, pagination };
  },
};

function _toDomain(training, targetProfileTrainings) {
  const targetProfileIds = targetProfileTrainings
    .filter(({ trainingId }) => trainingId === training.id)
    .map(({ targetProfileId }) => targetProfileId);

  return new Training({ ...training, targetProfileIds });
}
