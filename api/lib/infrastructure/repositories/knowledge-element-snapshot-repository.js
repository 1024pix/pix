const { find, get, mapValues } = require('lodash');
const BookshelfKnowledgeElementSnapshot = require('../data/knowledge-element-snapshot');
const KnowledgeElement = require('../../domain/models/KnowledgeElement');
const { knex } = require('../bookshelf');

function _toKnowledgeElementCollection(result) {
  const snapshot = get(result, 'snapshot');
  if (snapshot) {
    return snapshot.map((data) => new KnowledgeElement({
      ...data,
      createdAt: new Date(data.createdAt)
    }));
  }
  return null;
}

module.exports = {
  save({ userId, date, knowledgeElements }) {
    return new BookshelfKnowledgeElementSnapshot({
      userId,
      createdAt: date,
      snapshot: JSON.stringify(knowledgeElements),
    }).save();
  },

  async findOneByUserIdAndDate({ userId, date }) {
    const result = await knex
      .select('snapshot')
      .from('knowledge-element-snapshots')
      .where({ userId, createdAt: date })
      .first();

    return _toKnowledgeElementCollection(result);
  },

  async findByUserIdsAndDatesGroupedByUserId(userIdsAndDates) {
    const params = Object.entries(userIdsAndDates);
    const results = await knex
      .select('userId', 'snapshot')
      .from('knowledge-element-snapshots')
      .whereIn(['userId', 'createdAt'], params);

    return mapValues(userIdsAndDates, (_date, strUserId) => {
      const userId = parseInt(strUserId);
      const result = find(results, { userId });
      return _toKnowledgeElementCollection(result);
    });
  },
};
