const BookshelfKnowledgeElementSnapshot = require('../data/knowledge-element-snapshot'); 
const KnowledgeElement = require('../../domain/models/KnowledgeElement');

module.exports = {
  save({ userId, date, knowledgeElements }) {
    return new BookshelfKnowledgeElementSnapshot({
      userId,
      createdAt: date,
      snapshot: JSON.stringify(knowledgeElements),
    }).save();
  },

  async find({ userId, date }) {
    const result = await new BookshelfKnowledgeElementSnapshot().where({ userId, createdAt: date }).fetch();
    const { snapshot } = result.toJSON();
    return snapshot.map((data) => new KnowledgeElement({
      ...data,
      createdAt: new Date(data.createdAt)
    }));
  },
};
