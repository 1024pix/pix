const _ = require('lodash');
const { knex } = require('../../../db/knex-database-connection.js');
const BookshelfKnowledgeElementSnapshot = require('../orm-models/KnowledgeElementSnapshot.js');
const KnowledgeElement = require('../../domain/models/KnowledgeElement.js');
const { AlreadyExistingEntityError } = require('../../domain/errors.js');
const bookshelfUtils = require('../utils/knex-utils.js');
const DomainTransaction = require('../DomainTransaction.js');

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

module.exports = {
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
