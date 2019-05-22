const Assessment = require('./Assessment');
const constants = require('../constants');
const _ = require('lodash');

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
  }

  static parseId(scorecardId) {
    const [userId, competenceId] = scorecardId.split('_');
    return { userId: _.parseInt(userId), competenceId };
  }

  static buildFrom({ userId, knowledgeElements, competence, competenceEvaluation }) {

    const scorecardIdData = { id: `${userId}_${competence.id}` };
    const scoringData = _computeScoringDatas(knowledgeElements);
    const statusData = _getScorecardStatus(competenceEvaluation);
    const competenceData = _getCompetenceDatas(competence);

    return new Scorecard({
      ...scorecardIdData,
      ...competenceData,
      ...statusData,
      ...scoringData,
    });
  }
}

function _getScorecardStatus(competenceEvaluation) {

  if (!competenceEvaluation) {
    return { status: statuses.NOT_STARTED };
  }
  const stateOfAssessment = _.get(competenceEvaluation, 'assessment.state');
  if (stateOfAssessment === Assessment.states.COMPLETED) {
    return { status: statuses.COMPLETED };
  }
  return { status: statuses.STARTED };
}

function _getCompetenceDatas(competence) {
  return {
    name: competence.name,
    description: competence.description,
    competenceId: competence.id,
    index: competence.index,
    area: competence.area
  };
}

function _computeScoringDatas(knowledgeElements) {
  const totalEarnedPix = _.floor(_(knowledgeElements).sumBy('earnedPix'));
  const level = _getCompetenceLevel(totalEarnedPix);
  const pixScoreAheadOfNextLevel = _getpixScoreAheadOfNextLevel(totalEarnedPix);

  return { earnedPix: totalEarnedPix, level, pixScoreAheadOfNextLevel };
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
