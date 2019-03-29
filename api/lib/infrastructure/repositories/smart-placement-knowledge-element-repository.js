const SmartPlacementKnowledgeElement = require('../../domain/models/SmartPlacementKnowledgeElement');
const BookshelfKnowledgeElement = require('../data/knowledge-element');
const _ = require('lodash');

function _toDomain(knowledgeElementBookshelf) {
  return new SmartPlacementKnowledgeElement(knowledgeElementBookshelf.toJSON());
}

module.exports = {

  save(smartPlacementKnowledgeElement) {

    return Promise.resolve(_.omit(smartPlacementKnowledgeElement, 'createdAt'))
      .then((smartPlacementKnowledgeElement) => new BookshelfKnowledgeElement(smartPlacementKnowledgeElement))
      .then((knowledgeElementBookshelf) => knowledgeElementBookshelf.save())
      .then(_toDomain);
  },

  findByAssessmentId(assessmentId) {
    return BookshelfKnowledgeElement
      .where({ assessmentId })
      .fetchAll()
      .then((knowledgeElements) => knowledgeElements.map(_toDomain));
  },

  findUniqByUserId(userId, limitDate) {
    return BookshelfKnowledgeElement
      .query((qb) => {
        qb.where({ userId });
        if (limitDate) {
          qb.where('knowledge-elements.createdAt', '<', limitDate);
        }
      })
      .fetchAll()
      .then((knowledgeElements) => knowledgeElements.map(_toDomain))
      .then((knowledgeElements) => {
        return _(knowledgeElements)
          .orderBy('createdAt', 'desc')
          .uniqBy('skillId')
          .value();
      });
  },

  // TODO improve sum with pg request
  getSumOfPixFromUserKnowledgeElements(userId) {
    return BookshelfKnowledgeElement
      .query((qb) => {
        qb.select('earnedPix').where({ userId }).orderBy('createdAt', 'desc').distinct('skillId');
      })
      .fetchAll()
      .then((pixValues) => {
        return _.sumBy(pixValues.toJSON(), 'earnedPix');
      });
  }
};
