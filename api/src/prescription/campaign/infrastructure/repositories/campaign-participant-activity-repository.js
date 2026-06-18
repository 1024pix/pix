import { CAMPAIGN_FEATURES } from '../../../../shared/domain/constants.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { filterByFullName } from '../../../../shared/infrastructure/utils/filter-utils.js';
import { fetchPage } from '../../../../shared/infrastructure/utils/knex-utils.js';
import { CampaignParticipationStatuses } from '../../../shared/domain/constants.js';
import { CampaignParticipantActivity } from '../../domain/read-models/CampaignParticipantActivity.js';

// TODO move to its own model
class ParticipantActivityFilters {
  /** @type string */
  #status;
  /** @type string[] */
  #groups;
  /** @type string[] */
  #divisions;
  /** @type string */
  #participantExternalId;

  constructor({ status = null, search = null, groups = [], divisions = [], participantExternalId = null }) {
    this.#status = status;
    this.search = search;
    this.#groups = groups;
    this.#divisions = divisions;
    this.#participantExternalId = participantExternalId;
  }

  get participationStatus() {
    if (!this.#status) return [CampaignParticipationStatuses.SHARED, CampaignParticipationStatuses.STARTED];

    return [this.#status];
  }

  get groups() {
    if (this.#groups.length === 0) return null;
    return this.#groups?.map((group) => group.toLowerCase().trim());
  }

  get divisions() {
    if (this.#divisions.length === 0) return null;
    return this.#divisions?.map((division) => division.toLowerCase().trim());
  }

  get showNotStarted() {
    return this.#status === 'NOT_STARTED';
  }

  get participantExternalId() {
    return this.#participantExternalId;
  }
}

const campaignParticipantActivityRepository = {
  async findPaginatedByCampaignId({ page = { size: 25 }, campaignId, filters = {} }) {
    const knexConn = DomainTransaction.getConnection();
    const activityFilters = new ParticipantActivityFilters(filters);

    const externalIdFeature = await knexConn('campaign-features')
      .select('campaign-features.id')
      .join('features', 'features.id', 'featureId')
      .where({
        campaignId,
        'features.key': CAMPAIGN_FEATURES.EXTERNAL_ID.key,
      })
      .first();

    const query = knexConn('view-active-organization-learners')
      .select(
        'view-active-organization-learners.id AS organizationLearnerId',
        'view-active-organization-learners.firstName',
        'view-active-organization-learners.lastName',
        'campaign-participations.id AS campaignParticipationId',
        'campaign-participations.participantExternalId',
        'campaign-participations.status',
        knexConn('campaign-participations')
          .whereRaw('"organizationLearnerId" = "view-active-organization-learners"."id"')
          .and.whereNull('campaign-participations.deletedAt')
          .and.where('campaignId', campaignId)
          .count('id')
          .as('participationCount'),
      )
      .leftJoin('campaign-participations', function () {
        this.on('campaign-participations.organizationLearnerId', 'view-active-organization-learners.id')
          .andOnVal('campaign-participations.campaignId', campaignId)
          .andOnVal('isImproved', false)
          .andOnNull('campaign-participations.deletedAt');
      })
      .where(
        'view-active-organization-learners.organizationId',
        knexConn('campaigns').select('organizationId').where('id', campaignId),
      )
      .where('view-active-organization-learners.isDisabled', false)
      .modify(filterParticipations, activityFilters, knexConn)
      .orderByRaw('LOWER(??) ASC, LOWER(??) ASC', ['lastName', 'firstName']);

    const { results, pagination } = await fetchPage({ queryBuilder: query, paginationParams: page });

    const campaignParticipantsActivities = results.map(
      (result) =>
        new CampaignParticipantActivity({
          ...result,
          participantExternalId: externalIdFeature ? result.participantExternalId : undefined,
        }),
    );

    return {
      campaignParticipantsActivities,
      pagination,
    };
  },
};

function filterParticipations(queryBuilder, filters, knexConn) {
  queryBuilder
    .modify(filterByDivisions, filters, knexConn)
    .modify(filterByStatus, filters)
    .modify(filterByGroup, filters, knexConn)
    .modify(filterBySearch, filters)
    .modify(filterByParticipantExternalId, filters);
}

function filterBySearch(queryBuilder, filters) {
  if (filters.search) {
    filterByFullName(
      queryBuilder,
      filters.search,
      'view-active-organization-learners.firstName',
      'view-active-organization-learners.lastName',
    );
  }
}

function filterByDivisions(queryBuilder, filters, knexConn) {
  if (filters.divisions) {
    queryBuilder.whereIn(knexConn.raw('LOWER("view-active-organization-learners"."division")'), filters.divisions);
  }
}

function filterByStatus(queryBuilder, filters) {
  if (filters.showNotStarted) {
    queryBuilder.whereNull('campaign-participations.campaignId');
  } else {
    queryBuilder.whereIn('campaign-participations.status', filters.participationStatus);
  }
}

function filterByGroup(queryBuilder, filters, knexConn) {
  if (filters.groups) {
    queryBuilder.whereIn(knexConn.raw('LOWER("view-active-organization-learners"."group")'), filters.groups);
  }
}

function filterByParticipantExternalId(queryBuilder, filters) {
  if (filters.participantExternalId) {
    queryBuilder.whereRaw('LOWER(??) LIKE ?', [
      'campaign-participations.participantExternalId',
      `%${filters.participantExternalId.trim().toLowerCase()}%`,
    ]);
  }
}

export { campaignParticipantActivityRepository };
