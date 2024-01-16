import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection.js';
import { KnowledgeElement } from '../../domain/models/KnowledgeElement.js';
import { AlreadyExistingEntityError } from '../../domain/errors.js';
import * as knexUtils from '../utils/knex-utils.js';
import { DomainTransaction } from '../DomainTransaction.js';

function _toKnowledgeElementCollection({ snapshot } = {}) {
  if (!snapshot) return null;
  return snapshot.map(
    (data) =>
      new KnowledgeElement({
        ...data,
        createdAt: new Date(data.createdAt),
      }),
  );
}

const save = async function ({
  userId,
  snappedAt,
  knowledgeElements,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  try {
    const knexConn = domainTransaction.knexTransaction || knex;
    return await knexConn('knowledge-element-snapshots').insert({
      userId,
      snappedAt,
      snapshot: JSON.stringify(knowledgeElements),
    });
  } catch (error) {
    if (knexUtils.isUniqConstraintViolated(error)) {
      throw new AlreadyExistingEntityError(
        `A snapshot already exists for the user ${userId} at the datetime ${snappedAt}.`,
      );
    }
  }
};

const findByUserIdsAndSnappedAtDates = async function (userIdsAndSnappedAtDates = {}) {
  const params = Object.entries(userIdsAndSnappedAtDates);
  const results = await knex
    .select('userId', 'snapshot')
    .from('knowledge-element-snapshots')
    .whereIn(['userId', 'snappedAt'], params);

  const knowledgeElementsByUserId = {};
  for (const result of results) {
    knowledgeElementsByUserId[result.userId] = _toKnowledgeElementCollection(result);
  }

  const userIdsWithoutSnapshot = _.difference(
    Object.keys(userIdsAndSnappedAtDates),
    Object.keys(knowledgeElementsByUserId),
  );
  for (const userId of userIdsWithoutSnapshot) {
    knowledgeElementsByUserId[userId] = null;
  }

  return knowledgeElementsByUserId;
};

const _findByUserIdsAndSnappedAtDatesSyncCampaignParticipationId = function (userIdsAndSnappedAtDates) {
  return knex
    .select(
      'knowledge-element-snapshots.userId as userId',
      'knowledge-element-snapshots.snappedAt as snappedAt',
      'snapshot',
      'campaign-participations.id as campaignParticipationId',
    )
    .from('knowledge-element-snapshots')
    .join('campaign-participations', function () {
      this.on('campaign-participations.userId', 'knowledge-element-snapshots.userId').on(
        'campaign-participations.sharedAt',
        'knowledge-element-snapshots.snappedAt',
      );
    })
    .whereIn(['knowledge-element-snapshots.userId', 'snappedAt'], userIdsAndSnappedAtDates);
};

const findByUserIdsAndSnappedAtDatesSyncCampaignParticipationIdForProfileCollection = async function (
  userIdsAndSnappedAtDates,
) {
  const results = await _findByUserIdsAndSnappedAtDatesSyncCampaignParticipationId(userIdsAndSnappedAtDates);

  return results.map((result) => {
    const mappedKnowledgeElements = _toKnowledgeElementCollection({ snapshot: result.snapshot });
    return {
      userId: result.userId,
      snappedAt: result.snappedAt,
      campaignParticipationId: result.campaignParticipationId,
      knowledgeElements: _.groupBy(mappedKnowledgeElements, 'competenceId'),
    };
  });
};

const findByUserIdsAndSnappedAtDatesSyncCampaignParticipationIdForAssessment = async function (
  userIdsAndSnappedAtDates,
  campaignLearningContent,
) {
  const results = await _findByUserIdsAndSnappedAtDatesSyncCampaignParticipationId(userIdsAndSnappedAtDates);

  return results.map((result) => {
    const mappedKnowledgeElements = _toKnowledgeElementCollection({ snapshot: result.snapshot });
    return {
      userId: result.userId,
      campaignParticipationId: result.campaignParticipationId,
      knowledgeElements: campaignLearningContent.getKnowledgeElementsGroupedByCompetence(mappedKnowledgeElements),
    };
  });
};

export {
  save,
  findByUserIdsAndSnappedAtDates,
  findByUserIdsAndSnappedAtDatesSyncCampaignParticipationIdForAssessment,
  findByUserIdsAndSnappedAtDatesSyncCampaignParticipationIdForProfileCollection,
};
