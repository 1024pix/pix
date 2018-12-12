const SmartPlacementKnowledgeElement = require('../../domain/models/SmartPlacementKnowledgeElement');
const BookshelfKnowledgeElement = require('../data/knowledge-element');

module.exports = {

  save(smartPlacementKnowledgeElement) {
    return Promise.resolve(smartPlacementKnowledgeElement)
      .then((smartPlacementKnowledgeElement) => new BookshelfKnowledgeElement(smartPlacementKnowledgeElement))
      .then((knowledgeElementBookshelf) => knowledgeElementBookshelf.save())
      .then(toDomain);
  },
};

function toDomain(knowledgeElementBookshelf) {
  return new SmartPlacementKnowledgeElement(knowledgeElementBookshelf.toJSON());
}
