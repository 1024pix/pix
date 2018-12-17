const SmartPlacementKnowledgeElement = require('../../domain/models/SmartPlacementKnowledgeElement');
const BookshelfKnowledgeElement = require('../data/knowledge-element');
const _ = require('lodash');
module.exports = {

  save(smartPlacementKnowledgeElement) {

    return Promise.resolve(_.omit(smartPlacementKnowledgeElement, 'createdAt'))
      .then((smartPlacementKnowledgeElement) => new BookshelfKnowledgeElement(smartPlacementKnowledgeElement))
      .then((knowledgeElementBookshelf) => knowledgeElementBookshelf.save())
      .then(toDomain);
  },

  findByAssessmentId(assessmentId) {
    return BookshelfKnowledgeElement
      .where({ assessmentId })
      .fetchAll()
      .then((knowledgeElements) => knowledgeElements.map(toDomain));
  },

  findByUserId(userId) {
    return BookshelfKnowledgeElement
      .query((qb) => {
        qb.innerJoin('assessments', 'knowledge-elements.assessmentId', 'assessments.id');
        qb.where('assessments.userId', '=', userId);
        qb.where('assessments.type', '=', 'SMART_PLACEMENT');
      })
      .fetchAll()
      .then((knowledgeElements) => knowledgeElements.map(toDomain));
  }
};

function toDomain(knowledgeElementBookshelf) {
  return new SmartPlacementKnowledgeElement(knowledgeElementBookshelf.toJSON());
}
