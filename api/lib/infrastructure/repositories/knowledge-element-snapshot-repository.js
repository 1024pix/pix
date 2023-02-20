import _ from 'lodash';
import { knex } from '../../../db/knex-database-connection';
import BookshelfKnowledgeElementSnapshot from '../orm-models/KnowledgeElementSnapshot';
import KnowledgeElement from '../../domain/models/KnowledgeElement';
import { AlreadyExistingEntityError } from '../../domain/errors';
import bookshelfUtils from '../utils/knex-utils';
import DomainTransaction from '../DomainTransaction';

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

export default {
  async save({ userId, snappedAt, knowledgeElements, domainTransaction = DomainTransaction.emptyTransaction() }) {
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
  },

  async findByUserIdsAndSnappedAtDates(userIdsAndSnappedAtDates = {}) {
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
  },
};
