const _ = require('lodash');
const constants = require('../constants');
const Assessment = require('./Assessment');

const ScorecardStatusType = Object.freeze({
  NOT_STARTED: 'NOT_STARTED',
  STARTED: 'STARTED',
  COMPLETED: 'COMPLETED',
});

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
    this.level = this._getCompetenceLevel(roundedEarnedPix);
    this.pixScoreAheadOfNextLevel = this._getpixScoreAheadOfNextLevel(roundedEarnedPix);
    this.status = status;
  }

  static buildFrom({ userId, knowledgeElements, competence, competenceEvaluations }) {
    const totalEarnedPixByCompetence = _.sumBy(knowledgeElements, 'earnedPix');
    const status = Scorecard.computeStatus({
      knowledgeElements,
      competenceId: competence.id,
      competenceEvaluations
    });

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

  static computeStatus({ knowledgeElements, competenceId, competenceEvaluations }) {
    if (_.isEmpty(knowledgeElements)) {
      return ScorecardStatusType.NOT_STARTED;
    }

    const competenceEvaluationForCompetence = _.find(competenceEvaluations, { competenceId });
    const stateOfAssessment = _.get(competenceEvaluationForCompetence, 'assessment.state');

    if (stateOfAssessment === Assessment.states.COMPLETED) {
      return ScorecardStatusType.COMPLETED;
    }
    return ScorecardStatusType.STARTED;
  }

  _getCompetenceLevel(earnedPix) {
    const userLevel = Math.floor(earnedPix / constants.PIX_COUNT_BY_LEVEL);

    return Math.min(constants.MAX_REACHABLE_LEVEL, userLevel);
  }

  _getpixScoreAheadOfNextLevel(earnedPix) {
    return earnedPix % constants.PIX_COUNT_BY_LEVEL;
  }
}

Scorecard.StatusType = ScorecardStatusType;

module.exports = Scorecard;
