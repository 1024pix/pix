const _ = require('lodash');
const constants = require('../constants');
const Assessment = require('./Assessment');

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
    area,
    earnedPix,
    status,
  } = {}) {
    const roundedEarnedPix = Math.floor(earnedPix);

    this.id = id;
    // attributes
    this.name = name;
    this.description = description;
    this.competenceId = competenceId;
    this.index = index;
    this.area = area;
    this.earnedPix = roundedEarnedPix;
    this.level = _getCompetenceLevel(roundedEarnedPix);
    this.pixScoreAheadOfNextLevel = _getpixScoreAheadOfNextLevel(roundedEarnedPix);
    this.status = status;
  }

  static parseId(scorecardId) {
    const [userId, competenceId] = scorecardId.split('_');
    return { userId: _.parseInt(userId), competenceId };
  }

  static buildFrom({ userId, knowledgeElements, competence, competenceEvaluation }) {
    const totalEarnedPixByCompetence = _.sumBy(knowledgeElements, 'earnedPix');
    const status = _computeStatus(competenceEvaluation);

    return new Scorecard({
      id: `${userId}_${competence.id}`,
      name: competence.name,
      description: competence.description,
      competenceId: competence.id,
      index: competence.index,
      area: competence.area,
      earnedPix: totalEarnedPixByCompetence,
      status,
    });
  }

}

function _computeStatus(competenceEvaluation) {
  if (!competenceEvaluation) {
    return statuses.NOT_STARTED;
  }
  const stateOfAssessment = _.get(competenceEvaluation, 'assessment.state');
  if (stateOfAssessment === Assessment.states.COMPLETED) {
    return statuses.COMPLETED;
  }
  return statuses.STARTED;
}

function _getCompetenceLevel(earnedPix) {
  const userLevel = Math.floor(earnedPix / constants.PIX_COUNT_BY_LEVEL);
  return Math.min(constants.MAX_REACHABLE_LEVEL, userLevel);
}

function _getpixScoreAheadOfNextLevel(earnedPix) {
  return earnedPix % constants.PIX_COUNT_BY_LEVEL;
}

Scorecard.statuses = statuses;

module.exports = Scorecard;
