const _ = require('lodash');
const { knex } = require('../bookshelf');
const BookshelfKnowledgeElementSnapshot = require('../data/knowledge-element-snapshot');
const KnowledgeElement = require('../../domain/models/KnowledgeElement');
const { AlreadyExistingEntityError } = require('../../domain/errors');
const bookshelfUtils = require('../utils/knex-utils');

function _toKnowledgeElementCollection({ snapshot } = {}) {
  if (!snapshot) return null;
  return snapshot.map((data) => new KnowledgeElement({
    ...data,
    createdAt: new Date(data.createdAt),
  }));
}

module.exports = {
  async save({ userId, snappedAt, knowledgeElements }) {
    try {
      await new BookshelfKnowledgeElementSnapshot({
        userId,
        snappedAt,
        snapshot: JSON.stringify(knowledgeElements),
      }).save();
    } catch (error) {
      if (bookshelfUtils.isUniqConstraintViolated(error)) {
        throw new AlreadyExistingEntityError(`A snapshot already exists for the user ${userId} at the datetime ${snappedAt}.`);
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

    const userIdsWithoutSnapshot = _.difference(Object.keys(userIdsAndSnappedAtDates), Object.keys(knowledgeElementsByUserId));
    for (const userId of userIdsWithoutSnapshot) {
      knowledgeElementsByUserId[userId] = null;
    }

    return knowledgeElementsByUserId;
  },
};
