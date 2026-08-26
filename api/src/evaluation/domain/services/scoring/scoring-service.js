import _ from 'lodash';

import {
  MAX_REACHABLE_LEVEL,
  MAX_REACHABLE_PIX_BY_COMPETENCE,
  PIX_COUNT_BY_LEVEL,
} from '../../../../shared/constants.js';

/**
 * Score et niveau d'une compétence, depuis les acquis validés.
 *
 * La valeur d'un acquis (`pixValue`) se lit sur le référentiel courant : c'est
 * la projection vive de la position. Le score affiché à l'utilisateur ne la
 * suit pas en direct — il est figé à sa dernière action (table competence-scores) et
 * passe par calculateScoringInformationFromPix.
 *
 * @param {Skill[]} validatedSkills les acquis validés de la compétence
 */
function calculateScoringInformationForCompetence({
  validatedSkills,
  allowExcessPix = false,
  allowExcessLevel = false,
}) {
  return calculateScoringInformationFromPix({
    exactlyEarnedPix: _.sumBy(validatedSkills, 'pixValue'),
    allowExcessPix,
    allowExcessLevel,
  });
}

/**
 * Score et niveau d'une compétence, depuis un total de pix bruts — celui de la
 * solde de la compétence, figé à la dernière action de l'utilisateur.
 *
 * @param {number} exactlyEarnedPix somme brute des pixValue, avant arrondi et plafonnement
 */
function calculateScoringInformationFromPix({ exactlyEarnedPix, allowExcessPix = false, allowExcessLevel = false }) {
  const pixScoreForCompetence = _getPixScoreForOneCompetence(exactlyEarnedPix, allowExcessPix);
  const currentLevel = _getCompetenceLevel(exactlyEarnedPix, allowExcessLevel);
  const pixAheadForNextLevel = _getPixScoreAheadOfNextLevel(pixScoreForCompetence);
  return {
    realTotalPixScoreForCompetence: exactlyEarnedPix,
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

export {
  calculatePixScore,
  calculateScoringInformationForCompetence,
  calculateScoringInformationFromPix,
  getBlockedLevel,
  getBlockedPixScore,
};
