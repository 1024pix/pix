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

  findUniqByUserId(userId, limitDate) {
    return BookshelfKnowledgeElement
      .query((qb) => {
        qb.innerJoin('assessments', 'knowledge-elements.assessmentId', 'assessments.id');
        qb.where('assessments.userId', '=', userId);
        qb.where('assessments.type', '=', 'SMART_PLACEMENT');
        if(limitDate) {
          qb.where('knowledge-elements.createdAt', '<', limitDate);
        }
      })
      .fetchAll()
      .then((knowledgeElements) => knowledgeElements.map(toDomain))
      .then((knowledgeElements) => {
        return _(knowledgeElements)
          .orderBy('createdAt', 'desc')
          .uniqBy('skillId')
          .value();
      });
  },

  findFirstSavedKnowledgeElementsByUserId({ userId, skillIds }) {
    return BookshelfKnowledgeElement
      .query((qb) => {
        qb.innerJoin('assessments', 'knowledge-elements.assessmentId', 'assessments.id');
        qb.where('assessments.userId', '=', userId);
        qb.where('assessments.type', '=', 'SMART_PLACEMENT');
        if(skillIds) {
          qb.where('knowledge-elements.skillId', 'IN', skillIds);
        }
      })
      .fetchAll()
      .then((knowledgeElements) => knowledgeElements.map(toDomain))
      .then((knowledgeElements) => {
        return _(knowledgeElements)
          .orderBy('createdAt', 'asc')
          .uniqWith((ke1, ke2) => (ke1.skillId === ke2.skillId && ke1.status === ke2.status))
          .value();
      });
  }
};

function toDomain(knowledgeElementBookshelf) {
  return new SmartPlacementKnowledgeElement(knowledgeElementBookshelf.toJSON());
}
