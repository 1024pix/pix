const _ = require('lodash');
const constants = require('../constants');

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

  static buildFrom({ userId, userKEList, competence, competenceEvaluations }) {
    const sortedKEGroupedByCompetence = _.groupBy(userKEList, 'competenceId');
    const knowledgeElementsOfCompetence = sortedKEGroupedByCompetence[competence.id];
    const totalEarnedPixByCompetence = _.sumBy(knowledgeElementsOfCompetence, 'earnedPix');

    return new Scorecard({
      id: `${userId}_${competence.id}`,
      name: competence.name,
      description: competence.description,
      competenceId: competence.id,
      index: competence.index,
      area: competence.area,
      earnedPix: totalEarnedPixByCompetence,
      status: Scorecard._computeStatus(knowledgeElementsOfCompetence, competence.id, competenceEvaluations)
    });
  }

  static _computeStatus(knowledgeElements, competenceId, competenceEvaluations) {
    if (_.isEmpty(knowledgeElements)) {
      return 'NOT_STARTED';
    }

    const competenceEvaluationForCompetence = _.find(competenceEvaluations, { competenceId });
    const stateOfAssessment = _.get(competenceEvaluationForCompetence, 'assessment.state');
    if (stateOfAssessment === 'completed') {
      return 'COMPLETED';
    }
    return 'STARTED';
  }

  _getCompetenceLevel(earnedPix) {
    const userLevel = Math.floor(earnedPix / constants.PIX_COUNT_BY_LEVEL);

    return Math.min(constants.MAX_REACHABLE_LEVEL, userLevel);
  }

  _getpixScoreAheadOfNextLevel(earnedPix) {
    return earnedPix % constants.PIX_COUNT_BY_LEVEL;
  }
}

module.exports = Scorecard;
