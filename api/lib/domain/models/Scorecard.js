const Assessment = require('./Assessment');
const CompetenceEvaluation = require('./CompetenceEvaluation');
const constants = require('../constants');
const _ = require('lodash');
const moment = require('moment');

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
    status,
    daysBeforeReset,
  } = {}) {

    this.id = id;
    // attributes
    this.name = name;
    this.description = description;
    this.competenceId = competenceId;
    this.index = index;
    this.area = area;
    this.earnedPix = earnedPix;
    this.level = level;
    this.pixScoreAheadOfNextLevel = pixScoreAheadOfNextLevel;
    this.status = status;
    this.daysBeforeReset = daysBeforeReset;
  }

  static parseId(scorecardId) {
    const [userId, competenceId] = scorecardId.split('_');
    return { userId: _.parseInt(userId), competenceId };
  }

  static buildFrom({ userId, knowledgeElements, competence, competenceEvaluation }) {

    const totalEarnedPix = _getTotalEarnedPix(knowledgeElements);

    return new Scorecard({
      id: `${userId}_${competence.id}`,
      name: competence.name,
      description: competence.description,
      competenceId: competence.id,
      index: competence.index,
      area: competence.area,
      earnedPix: totalEarnedPix,
      level: _getCompetenceLevel(totalEarnedPix),
      pixScoreAheadOfNextLevel: _getPixScoreAheadOfNextLevel(totalEarnedPix),
      status: _getScorecardStatus(competenceEvaluation),
      daysBeforeReset: Scorecard.getRemainingDaysBeforeReset(knowledgeElements),
    });
  }

  static getRemainingDaysBeforeReset(knowledgeElements) {
    if (!knowledgeElements || knowledgeElements.length === 0) {
      return null;
    }
    const lastKnowledgeElement = _(knowledgeElements).sortBy(['createdAt']).last();
    const daysSinceLastKnowledgeElement = moment.utc().diff(lastKnowledgeElement.createdAt, 'days', true);

    const remainingDaysToWait = Math.ceil(constants.MINIMUM_DELAY_IN_DAYS_FOR_RESET - daysSinceLastKnowledgeElement);

    return remainingDaysToWait > 0 ? remainingDaysToWait : 0;
  }
}

function _getScorecardStatus(competenceEvaluation) {
  if (!competenceEvaluation) {
    return statuses.NOT_STARTED;
  }
  if (competenceEvaluation.status === CompetenceEvaluation.statuses.RESET) {
    return statuses.NOT_STARTED;
  }
  const stateOfAssessment = _.get(competenceEvaluation, 'assessment.state');
  if (stateOfAssessment === Assessment.states.COMPLETED) {
    return statuses.COMPLETED;
  }
  return statuses.STARTED;
}

function _getTotalEarnedPix(knowledgeElements) {
  return _.floor(_(knowledgeElements).sumBy('earnedPix'));
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
