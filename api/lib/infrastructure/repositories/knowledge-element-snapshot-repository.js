import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection.js';
import { BookshelfKnowledgeElementSnapshot } from '../orm-models/KnowledgeElementSnapshot.js';
import { KnowledgeElement } from '../../domain/models/KnowledgeElement.js';
import { AlreadyExistingEntityError } from '../../domain/errors.js';
import { bookshelfUtils } from '../utils/knex-utils.js';
import { DomainTransaction } from '../DomainTransaction.js';

function _toKnowledgeElementCollection({ snapshot } = {}) {
  if (!snapshot) return null;
  return snapshot.map(
    (data) =>
      new KnowledgeElement({
        ...data,
        createdAt: new Date(data.createdAt),
      })
  );
}

const save = async function ({
  userId,
  snappedAt,
  knowledgeElements,
  domainTransaction = DomainTransaction.emptyTransaction(),
}) {
  try {
    await new BookshelfKnowledgeElementSnapshot({
      userId,
      snappedAt,
      snapshot: JSON.stringify(knowledgeElements),
    }).save(null, { transacting: domainTransaction.knexTransaction });
  } catch (error) {
    if (bookshelfUtils.isUniqConstraintViolated(error)) {
      throw new AlreadyExistingEntityError(
        `A snapshot already exists for the user ${userId} at the datetime ${snappedAt}.`
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
    Object.keys(knowledgeElementsByUserId)
  );
  for (const userId of userIdsWithoutSnapshot) {
    knowledgeElementsByUserId[userId] = null;
  }

  return knowledgeElementsByUserId;
};

export { save, findByUserIdsAndSnappedAtDates };
