import _ from 'lodash';

import { knex } from '../../../../../db/knex-database-connection.js';
import { DomainTransaction } from '../../../../shared/domain/DomainTransaction.js';
import { AlreadyExistingEntityError } from '../../../../shared/domain/errors.js';
import { KnowledgeElement } from '../../../../shared/domain/models/KnowledgeElement.js';
import * as knexUtils from '../../../../shared/infrastructure/utils/knex-utils.js';
import { CampaignParticipationKnowledgeElementSnapshots } from '../../../shared/domain/read-models/CampaignParticipationKnowledgeElementSnapshots.js';

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

const save = async function ({ userId, snappedAt, knowledgeElements, campaignParticipationId }) {
  try {
    const knexConn = DomainTransaction.getConnection();
    return await knexConn('knowledge-element-snapshots').insert({
      userId,
      snappedAt,
      snapshot: JSON.stringify(knowledgeElements),
      campaignParticipationId,
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

/**
 * @typedef FindMultipleSnapshotsPayload
 * @type {object}
 * @property {number} userId
 * @property {date} sharedAt
 */

/**
 * @function
 * @name findCampaignParticipationKnowledgeElementSnapshots
 *
 * @param {number[]} campaignParticipationIds
 * @returns {Promise<Array<CampaignParticipationKnowledgeElementSnapshots>>}
 */
const findCampaignParticipationKnowledgeElementSnapshots = async function (campaignParticipationIds) {
  const knowledgeElements = await findByCampaignParticipationIds(campaignParticipationIds);
  const knowledgeElementsList = [];
  campaignParticipationIds.map((campaignParticipationId) =>
    knowledgeElementsList.push(
      new CampaignParticipationKnowledgeElementSnapshots({
        knowledgeElements: knowledgeElements[campaignParticipationId],
        campaignParticipationId: campaignParticipationId,
      }),
    ),
  );
  return knowledgeElementsList;
};

/**
 *
 * @param {number[]} campaignParticipationIds
 * @returns {Object.<number, KnowledgeElement[]>}
 */
const findByCampaignParticipationIds = async function (campaignParticipationIds) {
  const results = await knex
    .select('campaignParticipationId', 'snapshot')
    .from('knowledge-element-snapshots')
    .whereIn('campaignParticipationId', campaignParticipationIds);

  return Object.fromEntries(
    results.map(({ campaignParticipationId, snapshot }) => [
      campaignParticipationId,
      snapshot.map(({ createdAt, ...data }) => {
        return new KnowledgeElement({ ...data, createdAt: new Date(createdAt) });
      }),
    ]),
  );
};

export {
  findByCampaignParticipationIds,
  findByUserIdsAndSnappedAtDates,
  findCampaignParticipationKnowledgeElementSnapshots,
  save,
};
