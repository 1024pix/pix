const _ = require('lodash');
const { knex } = require('../bookshelf');
const BookshelfKnowledgeElementSnapshot = require('../data/knowledge-element-snapshot');
const KnowledgeElement = require('../../domain/models/KnowledgeElement');

function _toKnowledgeElementCollection({ snapshot } = {}) {
  if (!snapshot) return null;
  return snapshot.map((data) => new KnowledgeElement({
    ...data,
    createdAt: new Date(data.createdAt)
  }));
}

module.exports = {
  save({ userId, snappedAt, knowledgeElements }) {
    return new BookshelfKnowledgeElementSnapshot({
      userId,
      snappedAt,
      snapshot: JSON.stringify(knowledgeElements),
    }).save();
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
