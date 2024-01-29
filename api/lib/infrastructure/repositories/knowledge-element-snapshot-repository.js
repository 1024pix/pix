import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection.js';
import { KnowledgeElement } from '../../domain/models/KnowledgeElement.js';
import { AlreadyExistingEntityError } from '../../domain/errors.js';
import * as knexUtils from '../utils/knex-utils.js';
import { DomainTransaction } from '../DomainTransaction.js';
import { CampaignParticipationKnowledgeElementSnapshots } from '../../../src/prescription/shared/domain/read-models/CampaignParticipationKnowledgeElementSnapshots.js';

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
const findMultipleUsersFromUserIdsAndSnappedAtDates = async function (userIdsAndSnappedAtDates, campaignSkillIds) {
  const params = userIdsAndSnappedAtDates.map((userIdAndDate) => {
    return [userIdAndDate.userId, userIdAndDate.sharedAt];
  });
  const results = await knex
    .with(
      'ke-snapshot-filtered',
      knex
        .select(['userId', 'snappedAt', knex.raw('coalesce(jsonb_agg(obj), \'[]\') as "snapshot"')])
        .fromRaw('"knowledge-element-snapshots", jsonb_array_elements("snapshot") obj')
        // eslint-disable-next-line knex/avoid-injections
        .whereRaw(`obj->>'skillId' in ('${campaignSkillIds.join("','")}')`)
        .whereRaw(`obj->>'status' = 'validated'`)
        .whereIn(['userId', 'snappedAt'], params)
        .groupBy('userId', 'snappedAt'),
    )
    .select([
      'ke-snapshot-filtered.userId as userId',
      'snapshot',
      'campaign-participations.id as campaignParticipationId',
    ])
    .from('ke-snapshot-filtered')
    .join('campaign-participations', function () {
      this.on('campaign-participations.userId', 'ke-snapshot-filtered.userId').on(
        'campaign-participations.sharedAt',
        'ke-snapshot-filtered.snappedAt',
      );
    });

  // const results = await knex
  //   .select(
  //     'knowledge-element-snapshots.userId as userId',
  //     'snapshot',
  //     'campaign-participations.id as campaignParticipationId',
  //   )
  //   .from('knowledge-element-snapshots')
  //   .join('campaign-participations', function () {
  //     this.on('campaign-participations.userId', 'knowledge-element-snapshots.userId').on(
  //       'campaign-participations.sharedAt',
  //       'knowledge-element-snapshots.snappedAt',
  //     );
  //   })
  //   .whereIn(['knowledge-element-snapshots.userId', 'snappedAt'], params);

  return results.map((result) => {
    const mappedKnowledgeElements = _toKnowledgeElementCollection({ snapshot: result.snapshot });

    return new CampaignParticipationKnowledgeElementSnapshots({
      userId: result.userId,
      campaignParticipationId: result.campaignParticipationId,
      knowledgeElements: mappedKnowledgeElements,
    });
  });
};

export { save, findByUserIdsAndSnappedAtDates, findMultipleUsersFromUserIdsAndSnappedAtDates };
