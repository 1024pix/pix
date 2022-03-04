const BookshelfCampaignParticipation = require('../orm-models/CampaignParticipation');
const CampaignParticipation = require('../../domain/models/CampaignParticipation');
const CampaignParticipationStatuses = require('../../domain/models/CampaignParticipationStatuses');
const Campaign = require('../../domain/models/Campaign');
const bookshelfToDomainConverter = require('../utils/bookshelf-to-domain-converter');
const { knex } = require('../../../db/knex-database-connection');
const knowledgeElementRepository = require('./knowledge-element-repository');
const knowledgeElementSnapshotRepository = require('./knowledge-element-snapshot-repository');
const DomainTransaction = require('../DomainTransaction');

const { SHARED, TO_SHARE, STARTED } = CampaignParticipationStatuses;

module.exports = {
  async hasAssessmentParticipations(userId) {
    const { count } = await knex('campaign-participations')
      .count('campaign-participations.id')
      .join('campaigns', 'campaigns.id', 'campaignId')
      .where('campaigns.type', '=', Campaign.types.ASSESSMENT)
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
      .andWhere({ status: TO_SHARE })
      .andWhere({ 'campaigns.type': Campaign.types.PROFILES_COLLECTION })
      .orderBy('campaign-participations.createdAt', 'desc')
      .first();
    return result?.code || null;
  },
  async get(id, domainTransaction = DomainTransaction.emptyTransaction()) {
    const campaignParticipation = await BookshelfCampaignParticipation.where({ id }).fetch({
      withRelated: ['campaign', 'assessments'],
      transacting: domainTransaction.knexTransaction,
    });
    return bookshelfToDomainConverter.buildDomainObject(BookshelfCampaignParticipation, campaignParticipation);
  },

  async update(campaignParticipation, domainTransaction = DomainTransaction.emptyTransaction()) {
    const knexConn = domainTransaction.knexTransaction || knex;
    const attributes = _getAttributes(campaignParticipation);

    const updatedCampaignParticipation = await knexConn
      .from('campaign-participations')
      .where({ id: campaignParticipation.id })
      .update(attributes);

    return new CampaignParticipation(updatedCampaignParticipation);
  },

  async findProfilesCollectionResultDataByCampaignId(campaignId) {
    const results = await knex
      .with('campaignParticipationWithUser', (qb) => {
        qb.select([
          'campaign-participations.*',
          'organization-learners.studentNumber',
          'organization-learners.division',
          'organization-learners.group',
          'organization-learners.firstName',
          'organization-learners.lastName',
        ])
          .from('campaign-participations')
          .join('organization-learners', 'organization-learners.id', 'campaign-participations.organizationLearnerId')
          .where({ campaignId, isImproved: false });
      })
      .from('campaignParticipationWithUser');

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
      .limit(1);

    if (!result.length) return {};

    return result[0];
  },

  async countParticipationsByStatus(campaignId, campaignType) {
    const row = await knex('campaign-participations')
      .select([
        // eslint-disable-next-line knex/avoid-injections
        knex.raw(`sum(case when status = '${SHARED}' then 1 else 0 end) as shared`),
        // eslint-disable-next-line knex/avoid-injections
        knex.raw(`sum(case when status = '${TO_SHARE}' then 1 else 0 end) as completed`),
        // eslint-disable-next-line knex/avoid-injections
        knex.raw(`sum(case when status = '${STARTED}' then 1 else 0 end) as started`),
      ])
      .where({ campaignId, isImproved: false })
      .groupBy('campaignId')
      .first();

    return mapToParticipationByStatus(row, campaignType);
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
    validatedSkillsCount: campaignParticipation.validatedSkillsCount,
    pixScore: campaignParticipation.pixScore,
    masteryRate: campaignParticipation.masteryRate,
    organizationLearnerId: campaignParticipation.schoolingRegistrationId,
  };
}

function mapToParticipationByStatus(row = {}, campaignType) {
  const participationByStatus = {
    shared: row.shared || 0,
    completed: row.completed || 0,
  };
  if (campaignType === Campaign.types.ASSESSMENT) {
    participationByStatus.started = row.started || 0;
  }
  return participationByStatus;
}
