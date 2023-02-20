import { PIX_COUNT_BY_LEVEL, MAX_REACHABLE_LEVEL, MAX_REACHABLE_PIX_BY_COMPETENCE } from '../../constants';
import _ from 'lodash';

function calculateScoringInformationForCompetence({
  knowledgeElements,
  allowExcessPix = false,
  allowExcessLevel = false,
}) {
  const realTotalPixScoreForCompetence = _(knowledgeElements).sumBy('earnedPix');
  const pixScoreForCompetence = _getPixScoreForOneCompetence(realTotalPixScoreForCompetence, allowExcessPix);
  const currentLevel = _getCompetenceLevel(realTotalPixScoreForCompetence, allowExcessLevel);
  const pixAheadForNextLevel = _getPixScoreAheadOfNextLevel(pixScoreForCompetence);
  return {
    realTotalPixScoreForCompetence,
    pixScoreForCompetence,
    currentLevel,
    pixAheadForNextLevel,
  };
}

function getBlockedLevel(level) {
  return Math.min(level, MAX_REACHABLE_LEVEL);
}
function getBlockedPixScore(pixScore) {
  return Math.min(pixScore, MAX_REACHABLE_PIX_BY_COMPETENCE);
}
function _getPixScoreForOneCompetence(exactlyEarnedPix, allowExcessPix = false) {
  const userEarnedPix = _.floor(exactlyEarnedPix);
  if (allowExcessPix) {
    return userEarnedPix;
  }
  return getBlockedPixScore(userEarnedPix);
}

function _getCompetenceLevel(pixScoreForCompetence, allowExcessLevel = false) {
  const level = _.floor(pixScoreForCompetence / PIX_COUNT_BY_LEVEL);
  if (allowExcessLevel) {
    return level;
  }
  return getBlockedLevel(level);
}

function _getPixScoreAheadOfNextLevel(earnedPix) {
  return earnedPix % PIX_COUNT_BY_LEVEL;
}

function calculatePixScore(knowledgeElements) {
  return _(knowledgeElements)
    .groupBy('competenceId')
    .values()
    .map((knowledgeElementsByCompetence) =>
      calculateScoringInformationForCompetence({ knowledgeElements: knowledgeElementsByCompetence })
    )
    .sumBy('pixScoreForCompetence');
}

export default {
  calculateScoringInformationForCompetence,
  getBlockedLevel,
  getBlockedPixScore,
  calculatePixScore,
};
