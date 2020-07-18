const BookshelfKnowledgeElementSnapshot = require('../data/knowledge-element-snapshot');

module.exports = {
  save({ userId, snappedAt, knowledgeElements }) {
    return new BookshelfKnowledgeElementSnapshot({
      userId,
      snappedAt,
      snapshot: JSON.stringify(knowledgeElements),
    }).save();
  },
};
