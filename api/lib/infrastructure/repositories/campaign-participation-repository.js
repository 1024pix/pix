const BookshelfCampaignParticipation = require('../orm-models/CampaignParticipation');
const CampaignParticipationStatuses = require('../../domain/models/CampaignParticipationStatuses');
const CampaignTypes = require('../../domain/models/CampaignTypes');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { knex } = require('../../../db/knex-database-connection');
const knowledgeElementRepository = require('./knowledge-element-repository');
const knowledgeElementSnapshotRepository = require('./knowledge-element-snapshot-repository');
const CampaignParticipation = require('../../domain/models/CampaignParticipation');
const Assessment = require('../../domain/models/Assessment');
const Campaign = require('../../domain/models/Campaign');
const DomainTransaction = require('../DomainTransaction');
const { NotFoundError } = require('../../domain/errors');

const { SHARED, TO_SHARE, STARTED } = CampaignParticipationStatuses;

module.exports = {
  async hasAssessmentParticipations(userId) {
    const { count } = await knex('campaign-participations')
      .count('campaign-participations.id')
      .join('campaigns', 'campaigns.id', 'campaignId')
      .where('campaigns.type', '=', CampaignTypes.ASSESSMENT)
      .andWhere({ userId })
      .first();
    return count > 0;
  },
  async getCodeOfLastParticipationToProfilesCollectionCampaignForUser(userId) {
    const result = await knex('campaign-participations')
      .select('campaigns.code')
      .join('campaigns', 'campaigns.id', 'campaignId')
      .where({ userId })
      .whereNull('deletedAt')
      .whereNull('archivedAt')
      .andWhere({ status: TO_SHARE })
      .andWhere({ 'campaigns.type': CampaignTypes.PROFILES_COLLECTION })
      .orderBy('campaign-participations.createdAt', 'desc')
      .first();
    return result?.code || null;
  },
  async get(id, domainTransaction = DomainTransaction.emptyTransaction()) {
    const knexConn = domainTransaction.knexTransaction || knex;
    const campaignParticipation = await knexConn('campaign-participations').where({ id }).first();
    const campaign = await knexConn('campaigns').where({ id: campaignParticipation.campaignId }).first();
    const assessments = await knexConn('assessments').where({ campaignParticipationId: id });
    return new CampaignParticipation({
      ...campaignParticipation,
      campaign: new Campaign(campaign),
      assessments: assessments.map((assessment) => new Assessment(assessment)),
    });
  },

  async update(campaignParticipation, domainTransaction = DomainTransaction.emptyTransaction()) {
    const knexConn = domainTransaction.knexTransaction || knex;
    const attributes = _getAttributes(campaignParticipation);

    await knexConn.from('campaign-participations').where({ id: campaignParticipation.id }).update(attributes);
  },

  async findProfilesCollectionResultDataByCampaignId(campaignId) {
    const results = await knex('campaign-participations')
      .select([
        'campaign-participations.*',
        'organization-learners.studentNumber',
        'organization-learners.division',
        'organization-learners.group',
        'organization-learners.firstName',
        'organization-learners.lastName',
      ])
      .join('organization-learners', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
      .where({ campaignId, isImproved: false, deletedAt: null });

    return results.map(_rowToResult);
  },

  findLatestOngoingByUserId(userId) {
    return BookshelfCampaignParticipation.query((qb) => {
      qb.innerJoin('campaigns', 'campaign-participations.campaignId', 'campaigns.id');
      qb.whereNull('campaigns.archivedAt');
      qb.orderBy('campaign-participations.createdAt', 'DESC');
    })
      .where({ userId })
      .fetchAll({
        required: false,
        withRelated: ['campaign', 'assessments'],
      })
      .then((campaignParticipations) =>
        bookshelfToDomainConverter.buildDomainObjects(BookshelfCampaignParticipation, campaignParticipations)
      );
  },

  async findOneByCampaignIdAndUserId({ campaignId, userId }) {
    const campaignParticipation = await BookshelfCampaignParticipation.where({
      campaignId,
      userId,
      isImproved: false,
    }).fetch({ require: false, withRelated: ['assessments'] });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfCampaignParticipation, campaignParticipation);
  },

  async updateWithSnapshot(campaignParticipation, domainTransaction = DomainTransaction.emptyTransaction()) {
    await this.update(campaignParticipation, domainTransaction);

    const knowledgeElements = await knowledgeElementRepository.findUniqByUserId({
      userId: campaignParticipation.userId,
      limitDate: campaignParticipation.sharedAt,
      domainTransaction,
    });
    await knowledgeElementSnapshotRepository.save({
      userId: campaignParticipation.userId,
      snappedAt: campaignParticipation.sharedAt,
      knowledgeElements,
      domainTransaction,
    });
  },

  async isRetrying({ campaignParticipationId }) {
    const { id: campaignId, userId } = await knex('campaigns')
      .select('campaigns.id', 'userId')
      .join('campaign-participations', 'campaigns.id', 'campaignId')
      .where({ 'campaign-participations.id': campaignParticipationId })
      .first();

    const campaignParticipations = await knex('campaign-participations')
      .select('sharedAt', 'isImproved')
      .where({ campaignId, userId });

    return (
      campaignParticipations.length > 1 &&
      campaignParticipations.some((participation) => !participation.isImproved && !participation.sharedAt)
    );
  },

  async countParticipationsByStage(campaignId, stagesBoundaries) {
    const participationCounts = stagesBoundaries.map((boundary) => {
      const from = boundary.from / 100;
      const to = boundary.to / 100;
      return knex.raw(
        'COUNT("id") FILTER (WHERE "masteryRate" between ?? and ??) OVER (PARTITION BY "campaignId") AS ??',
        [from, to, String(boundary.id)]
      );
    });

    const result = await knex
      .select(participationCounts)
      .from('campaign-participations')
      .where('campaign-participations.campaignId', '=', campaignId)
      .where('campaign-participations.isImproved', '=', false)
      .where('campaign-participations.deletedAt', 'is', null)
      .limit(1);

    if (!result.length) return {};

    return result[0];
  },

  async countParticipationsByStatus(campaignId, campaignType) {
    const row = await knex('campaign-participations')
      .select([
        knex.raw(`sum(case when status = ? then 1 else 0 end) as shared`, SHARED),
        knex.raw(`sum(case when status = ? then 1 else 0 end) as completed`, TO_SHARE),
        knex.raw(`sum(case when status = ? then 1 else 0 end) as started`, STARTED),
      ])
      .where({ campaignId, isImproved: false, deletedAt: null })
      .groupBy('campaignId')
      .first();

    return mapToParticipationByStatus(row, campaignType);
  },

  async getAllCampaignParticipationsInCampaignForASameLearner({
    campaignId,
    campaignParticipationId,
    domainTransaction,
  }) {
    const knexConn = domainTransaction.knexTransaction;
    const result = await knexConn('campaign-participations')
      .select('organizationLearnerId')
      .where({ id: campaignParticipationId, campaignId })
      .first();

    if (!result) {
      throw new NotFoundError(
        `There is no campaign participation with the id "${campaignParticipationId}" for the campaign wih the id "${campaignId}"`
      );
    }

    const campaignParticipations = await knexConn('campaign-participations').where({
      campaignId,
      organizationLearnerId: result.organizationLearnerId,
      deletedAt: null,
      deletedBy: null,
    });

    return campaignParticipations.map((campaignParticipation) => new CampaignParticipation(campaignParticipation));
  },

  async delete({ id, deletedAt, deletedBy, domainTransaction }) {
    const knexConn = domainTransaction.knexTransaction;
    return await knexConn('campaign-participations').where({ id }).update({ deletedAt, deletedBy });
  },
};

function _rowToResult(row) {
  return {
    id: row.id,
    createdAt: new Date(row.createdAt),
    isShared: row.status === CampaignParticipationStatuses.SHARED,
    sharedAt: row.sharedAt ? new Date(row.sharedAt) : null,
    participantExternalId: row.participantExternalId,
    userId: row.userId,
    isCompleted: row.state === 'completed',
    studentNumber: row.studentNumber,
    participantFirstName: row.firstName,
    participantLastName: row.lastName,
    division: row.division,
    pixScore: row.pixScore,
    group: row.group,
  };
}

function _getAttributes(campaignParticipation) {
  return {
    createdAt: campaignParticipation.createdAt,
    participantExternalId: campaignParticipation.participantExternalId,
    sharedAt: campaignParticipation.sharedAt,
    status: campaignParticipation.status,
    campaignId: campaignParticipation.campaignId,
    userId: campaignParticipation.userId,
    organizationLearnerId: campaignParticipation.organizationLearnerId,
  };
}

function mapToParticipationByStatus(row = {}, campaignType) {
  const participationByStatus = {
    shared: row.shared || 0,
    completed: row.completed || 0,
  };
  if (campaignType === CampaignTypes.ASSESSMENT) {
    participationByStatus.started = row.started || 0;
  }
  return participationByStatus;
}
