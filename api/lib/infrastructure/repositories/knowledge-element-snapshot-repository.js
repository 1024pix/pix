const BookshelfKnowledgeElementSnapshot = require('../data/knowledge-element-snapshot'); 
const KnowledgeElement = require('../../domain/models/KnowledgeElement');
const { knex } = require('../bookshelf');

module.exports = {
  save({ userId, date, knowledgeElements }) {
    return new BookshelfKnowledgeElementSnapshot({
      userId,
      createdAt: date,
      snapshot: JSON.stringify(knowledgeElements),
    }).save();
  },

  async find({ userId, date }) {
    const result = await knex
      .select('snapshot')
      .from('knowledge-element-snapshots')
      .where({ userId, createdAt: date })
      .first();

    if (!result) {
      return null;
    }

    return result.snapshot.map((data) => new KnowledgeElement({
      ...data,
      createdAt: new Date(data.createdAt)
    }));
  },
};
