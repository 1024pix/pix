const SmartPlacementKnowledgeElement = require('../../domain/models/SmartPlacementKnowledgeElement');
const Answer = require('../../domain/models/Answer');
const BookshelfKnowledgeElement = require('../data/knowledge-element');
const _ = require('lodash');
const Bookshelf = require('../bookshelf');

function _toDomain(knowledgeElementBookshelf) {
  const knowledgeElement = new SmartPlacementKnowledgeElement(knowledgeElementBookshelf.toJSON());
  //knowledgeElement.answer = new Answer(knowledgeElementBookshelf.related('answer').toJSON());
  return knowledgeElement;
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

  findUniqByUserId({ userId, limitDate }) {
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

  getSumOfPixFromUserKnowledgeElements(userId) {
    return Bookshelf.knex.with('earnedPixWithRankPerSkill',
      (qb) => {
        qb.select('earnedPix', Bookshelf.knex.raw('ROW_NUMBER() OVER (PARTITION BY ?? ORDER BY ?? DESC) AS rank', ['skillId', 'createdAt']))
          .from('knowledge-elements')
          .where({ userId });
      })
      .sum('earnedPix AS earnedPix')
      .from('earnedPixWithRankPerSkill')
      .where({ rank: 1 })
      .then((result) => result.rows ? result.rows : result)
      .then(([{ earnedPix }]) => earnedPix);
  },

  async findUniqByUserIdWithAnswersAndSkills(userId, limitDate) {
    return BookshelfKnowledgeElement
      .query((qb) => {
        qb.where({ userId });
        if (limitDate) {
          qb.where('knowledge-elements.createdAt', '<', limitDate);
        }
      })
      .fetchAll({ withRelated: ['answer'] })
      .then((knowledgeElements) => knowledgeElements.map(_toDomain))
      .then((knowledgeElements) => {
        return _(knowledgeElements)
          .orderBy('createdAt', 'desc')
          .uniqBy('skillId')
          .value();
      });
  }
};
