const SmartPlacementKnowledgeElement = require('../../domain/models/SmartPlacementKnowledgeElement');
const BookshelfKnowledgeElement = require('../data/knowledge-element');
const moment = require('moment');
module.exports = {

  save(smartPlacementKnowledgeElement) {
    smartPlacementKnowledgeElement.createdAt = moment().format('YYYY-MM-DD HH:mm:ss');
    return Promise.resolve(smartPlacementKnowledgeElement)
      .then((smartPlacementKnowledgeElement) => new BookshelfKnowledgeElement(smartPlacementKnowledgeElement))
      .then((knowledgeElementBookshelf) => knowledgeElementBookshelf.save())
      .then(toDomain);
  },

  findByAssessmentId(assessmentId) {
    return BookshelfKnowledgeElement
      .where({ assessmentId })
      .fetchAll()
      .then((knowledgeElement) => knowledgeElement.map(toDomain));
  },
};

function toDomain(knowledgeElementBookshelf) {
  return new SmartPlacementKnowledgeElement(knowledgeElementBookshelf.toJSON());
}
