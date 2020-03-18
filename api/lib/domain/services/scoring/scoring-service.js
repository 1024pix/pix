const {
  PIX_COUNT_BY_LEVEL,
  MAX_REACHABLE_LEVEL,
  MAX_REACHABLE_PIX_BY_COMPETENCE,
} = require('../../constants');

const _ = require('lodash');

function calculateScoringInformationForCompetence(knowledgeElements, blockReachablePixAndLevel = true) {

  const realTotalPixScoreForCompetence = _(knowledgeElements).sumBy('earnedPix');
  const pixScoreForCompetence = _getPixScoreForOneCompetence(realTotalPixScoreForCompetence, blockReachablePixAndLevel);
  const currentLevel = _getCompetenceLevel(pixScoreForCompetence, blockReachablePixAndLevel);
  const pixAheadForNextLevel = _getPixScoreAheadOfNextLevel(pixScoreForCompetence);
  return {
    realTotalPixScoreForCompetence,
    pixScoreForCompetence,
    currentLevel,
    pixAheadForNextLevel
  };
}

function getBlockedLevel(level) {
  return _getBlockedLevel(level);
}
function getCompetencePixScore(pixScore) {
  return _getBlockedPixScoreByCompetence(pixScore);
}

function getCompetenceLevelByPix(pix) {
  return _getCompetenceLevel(pix, true);
}

function totalUserPixScore(pixEarnedByCompetence) {
  const pixByCompetenceLimited = _.map(pixEarnedByCompetence, (pixEarnedForOneCompetence) => _getBlockedPixScoreByCompetence(pixEarnedForOneCompetence));
  return _.sum(pixByCompetenceLimited);
}

module.exports = {
  calculateScoringInformationForCompetence,
  getBlockedLevel,
  getCompetenceLevelByPix,
  totalUserPixScore,
  getCompetencePixScore
};

function _getPixScoreForOneCompetence(exactlyEarnedPix, blockReachablePixAndLevel = true) {
  const userEarnedPix = _.floor(exactlyEarnedPix);
  if (blockReachablePixAndLevel) {
    return _getBlockedPixScoreByCompetence(userEarnedPix);
  }
  return userEarnedPix;
}

function _getCompetenceLevel(pixScoreForCompetence, blockReachablePixAndLevel = true) {
  const level = _.floor(pixScoreForCompetence / PIX_COUNT_BY_LEVEL);
  if (blockReachablePixAndLevel) {
    return _getBlockedLevel(level);
  }
  return level;
}

function _getPixScoreAheadOfNextLevel(earnedPix) {
  return earnedPix % PIX_COUNT_BY_LEVEL;
}

function _getBlockedLevel(level) {
  return Math.min(level, MAX_REACHABLE_LEVEL);
}

function _getBlockedPixScoreByCompetence(pixScore) {
  return Math.min(pixScore, MAX_REACHABLE_PIX_BY_COMPETENCE);
}
