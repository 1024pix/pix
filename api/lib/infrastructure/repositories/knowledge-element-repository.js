const KnowledgeElement = require('../../domain/models/KnowledgeElement');
const BookshelfKnowledgeElement = require('../data/knowledge-element');
const _ = require('lodash');
const Bookshelf = require('../bookshelf');

function _toDomain(knowledgeElementBookshelf) {
  const knowledgeElements = knowledgeElementBookshelf.toJSON();
  return _.isArray(knowledgeElements)
    ? knowledgeElements.map((ke) => new KnowledgeElement(ke))
    : new KnowledgeElement(knowledgeElements);
}

function _getUniqMostRecents(knowledgeElements) {
  return _(knowledgeElements)
    .orderBy('createdAt', 'desc')
    .uniqBy('skillId')
    .value();
}

function _dropResetKnowledgeElements(knowledgeElements) {
  return _.reject(knowledgeElements, { status: KnowledgeElement.StatusType.RESET });
}

module.exports = {

  save(knowledgeElement) {

    return Promise.resolve(_.omit(knowledgeElement, 'createdAt'))
      .then((knowledgeElement) => new BookshelfKnowledgeElement(knowledgeElement))
      .then((knowledgeElementBookshelf) => knowledgeElementBookshelf.save())
      .then(_toDomain);
  },

  findByAssessmentId(assessmentId) {
    return BookshelfKnowledgeElement
      .where({ assessmentId })
      .fetchAll()
      .then(_toDomain)
      .then(_dropResetKnowledgeElements);
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
      .then(_toDomain)
      .then(_getUniqMostRecents)
      .then(_dropResetKnowledgeElements);
  },

  findUniqByUserIdAndCompetenceId({ userId, competenceId }) {
    return BookshelfKnowledgeElement
      .where({ userId, competenceId })
      .fetchAll()
      .then(_toDomain)
      .then(_getUniqMostRecents)
      .then(_dropResetKnowledgeElements);
  },

  findUniqByUserIdGroupedByCompetenceId({ userId, limitDate }) {
    return this.findUniqByUserId({ userId, limitDate })
      .then(_dropResetKnowledgeElements)
      .then((knowledgeElements) => _.groupBy(knowledgeElements, 'competenceId'));
  },

  findUniqByUserIdAndCompetenceId({ userId, competenceId }) {
    return BookshelfKnowledgeElement
      .where({ userId, competenceId })
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

};

