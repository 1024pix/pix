import _ from 'lodash';

import { knex } from '../../../db/knex-database-connection.js';
import { CampaignParticipationKnowledgeElementSnapshots } from '../../../src/prescription/shared/domain/read-models/CampaignParticipationKnowledgeElementSnapshots.js';
import { AlreadyExistingEntityError } from '../../../src/shared/domain/errors.js';
import * as knexUtils from '../../../src/shared/infrastructure/utils/knex-utils.js';
import { KnowledgeElement } from '../../domain/models/KnowledgeElement.js';
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

/**
 * @typedef FindMultipleSnapshotsPayload
 * @type {object}
 * @property {number} userId
 * @property {date} sharedAt
 */

/**
 * @function
 * @name findMultipleUsersFromUserIdsAndSnappedAtDates
 *
 * @param {Array<FindMultipleSnapshotsPayload>} userIdsAndSnappedAtDates
 * @returns {Promise<Array<CampaignParticipationKnowledgeElementSnapshots>>}
 */
const findMultipleUsersFromUserIdsAndSnappedAtDates = async function (userIdsAndSnappedAtDates) {
  const params = userIdsAndSnappedAtDates.map((userIdAndDate) => {
    return [userIdAndDate.userId, userIdAndDate.sharedAt];
  });

  const results = await knex
    .select('userId', 'snapshot', 'snappedAt')
    .from('knowledge-element-snapshots')
    .whereIn(['knowledge-element-snapshots.userId', 'snappedAt'], params);

  return results.map((result) => {
    const mappedKnowledgeElements = _toKnowledgeElementCollection({ snapshot: result.snapshot });

    return new CampaignParticipationKnowledgeElementSnapshots({
      userId: result.userId,
      snappedAt: result.snappedAt,
      knowledgeElements: mappedKnowledgeElements,
    });
  });
};

export { findByUserIdsAndSnappedAtDates, findMultipleUsersFromUserIdsAndSnappedAtDates, save };
