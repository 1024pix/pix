const _ = require('lodash');
const Assessment = require('./Assessment');
const CompetenceEvaluation = require('./CompetenceEvaluation');
const KnowledgeElement = require('./KnowledgeElement');
const constants = require('../constants');

const statuses = {
  NOT_STARTED: 'NOT_STARTED',
  STARTED: 'STARTED',
  COMPLETED: 'COMPLETED',
};

class Scorecard {
  constructor({
    id,
    name,
    description,
    competenceId,
    index,
    level,
    area,
    pixScoreAheadOfNextLevel,
    earnedPix,
    exactlyEarnedPix,
    status,
    remainingDaysBeforeReset,
    tutorials,
  } = {}) {

    this.id = id;
    // attributes
    this.name = name;
    this.description = description;
    this.competenceId = competenceId;
    this.index = index;
    this.area = area;
    this.earnedPix = earnedPix;
    this.exactlyEarnedPix = exactlyEarnedPix;
    this.level = level;
    this.pixScoreAheadOfNextLevel = pixScoreAheadOfNextLevel;
    this.status = status;
    this.remainingDaysBeforeReset = remainingDaysBeforeReset;
    this.tutorials = tutorials;
  }

  static parseId(scorecardId) {
    const [userId, competenceId] = scorecardId.split('_');
    return { userId: _.parseInt(userId), competenceId };
  }

  static buildFrom({ userId, knowledgeElements, competence, competenceEvaluation, blockReachablePixAndLevel }) {
    const exactlyEarnedPix = _(knowledgeElements).sumBy('earnedPix');
    const totalEarnedPix = _getTotalEarnedPix(exactlyEarnedPix, blockReachablePixAndLevel);
    const remainingDaysBeforeReset = _.isEmpty(knowledgeElements) ? null : Scorecard.computeRemainingDaysBeforeReset(knowledgeElements);

    return new Scorecard({
      id: `${userId}_${competence.id}`,
      name: competence.name,
      description: competence.description,
      competenceId: competence.id,
      index: competence.index,
      area: competence.area,
      earnedPix: totalEarnedPix,
      exactlyEarnedPix,
      level: _getCompetenceLevel(totalEarnedPix),
      pixScoreAheadOfNextLevel: _getPixScoreAheadOfNextLevel(totalEarnedPix),
      status: _getScorecardStatus(competenceEvaluation, knowledgeElements),
      remainingDaysBeforeReset,
    });
  }

  static computeRemainingDaysBeforeReset(knowledgeElements) {
    const daysSinceLastKnowledgeElement = KnowledgeElement.computeDaysSinceLastKnowledgeElement(knowledgeElements);
    const remainingDaysToWait = Math.ceil(constants.MINIMUM_DELAY_IN_DAYS_FOR_RESET - daysSinceLastKnowledgeElement);

    return remainingDaysToWait > 0 ? remainingDaysToWait : 0;
  }
}

function _getScorecardStatus(competenceEvaluation, knowledgeElements) {
  if (!competenceEvaluation || competenceEvaluation.status === CompetenceEvaluation.statuses.RESET) {
    return _.isEmpty(knowledgeElements) ? statuses.NOT_STARTED : statuses.STARTED;
  }
  const stateOfAssessment = _.get(competenceEvaluation, 'assessment.state');
  if (stateOfAssessment === Assessment.states.COMPLETED) {
    return statuses.COMPLETED;
  }
  return statuses.STARTED;
}

function _getTotalEarnedPix(exactlyEarnedPix, blockReachablePixAndLevel) {
  const userTotalEarnedPix = _.floor(exactlyEarnedPix);
  if (blockReachablePixAndLevel) {
    return Math.min(userTotalEarnedPix, constants.MAX_REACHABLE_PIX_BY_COMPETENCE);
  }
  return userTotalEarnedPix;
}

function _getCompetenceLevel(earnedPix) {
  const userLevel = _.floor(earnedPix / constants.PIX_COUNT_BY_LEVEL);
  return Math.min(constants.MAX_REACHABLE_LEVEL, userLevel);
}

function _getPixScoreAheadOfNextLevel(earnedPix) {
  return earnedPix % constants.PIX_COUNT_BY_LEVEL;
}

Scorecard.statuses = statuses;

module.exports = Scorecard;
