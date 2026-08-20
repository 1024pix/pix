import _ from 'lodash';

import {
  MAX_REACHABLE_LEVEL,
  MAX_REACHABLE_PIX_BY_COMPETENCE,
  PIX_COUNT_BY_LEVEL,
} from '../../../../shared/constants.js';

/**
 * Score et niveau d'une compétence, depuis les acquis validés.
 *
 * La valeur d'un acquis (`pixValue`) se lit sur le référentiel courant : elle
 * n'est figée nulle part, le score dit toujours la vérité du jour.
 *
 * @param {Skill[]} validatedSkills les acquis validés de la compétence
 */
function calculateScoringInformationForCompetence({
  validatedSkills,
  allowExcessPix = false,
  allowExcessLevel = false,
}) {
  const realTotalPixScoreForCompetence = _.sumBy(validatedSkills, 'pixValue');
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

/**
 * Score global : la somme des scores par compétence, chacun plafonné.
 *
 * @param {Skill[]} validatedSkills
 */
function calculatePixScore(validatedSkills) {
  return _(validatedSkills)
    .groupBy('competenceId')
    .values()
    .map((validatedSkillsOfCompetence) =>
      calculateScoringInformationForCompetence({ validatedSkills: validatedSkillsOfCompetence }),
    )
    .sumBy('pixScoreForCompetence');
}

export { calculatePixScore, calculateScoringInformationForCompetence, getBlockedLevel, getBlockedPixScore };
