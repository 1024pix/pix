import _ from 'lodash';
import { Assessment } from '../../../shared/domain/models/Assessment.js';
import { CompetenceEvaluation } from './CompetenceEvaluation.js';
import { KnowledgeElement } from '../../../../lib/domain/models/KnowledgeElement.js';
import {
  MINIMUM_DELAY_IN_DAYS_FOR_RESET,
  MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING,
  PIX_COUNT_BY_LEVEL,
  MAX_REACHABLE_LEVEL,
} from '../../../../lib/domain/constants.js';
import * as scoringService from '../../../../lib/domain/services/scoring/scoring-service.js';

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
    remainingDaysBeforeImproving,
    tutorials,
    maxReachableLevel = MAX_REACHABLE_LEVEL,
  } = {}) {
    this.id = id;
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
    this.remainingDaysBeforeImproving = remainingDaysBeforeImproving;
    this.tutorials = tutorials;
    this.maxReachableLevel = maxReachableLevel;
  }

  static parseId(scorecardId) {
    const [userId, competenceId] = scorecardId.split('_');
    return { userId: _.parseInt(userId), competenceId };
  }

  static buildFrom({
    userId,
    knowledgeElements,
    competence,
    area,
    competenceEvaluation,
    allowExcessPix = false,
    allowExcessLevel = false,
  }) {
    const { realTotalPixScoreForCompetence, pixScoreForCompetence, currentLevel, pixAheadForNextLevel } =
      scoringService.calculateScoringInformationForCompetence({ knowledgeElements, allowExcessPix, allowExcessLevel });
    const remainingDaysBeforeReset = _.isEmpty(knowledgeElements)
      ? null
      : Scorecard.computeRemainingDaysBeforeReset(knowledgeElements);
    const remainingDaysBeforeImproving = _.isEmpty(knowledgeElements)
      ? null
      : Scorecard.computeRemainingDaysBeforeImproving(knowledgeElements);
    return new Scorecard({
      id: `${userId}_${competence.id}`,
      name: competence.name,
      description: competence.description,
      competenceId: competence.id,
      index: competence.index,
      area,
      earnedPix: pixScoreForCompetence,
      exactlyEarnedPix: realTotalPixScoreForCompetence,
      level: currentLevel,
      pixScoreAheadOfNextLevel: pixAheadForNextLevel,
      status: _getScorecardStatus(competenceEvaluation, knowledgeElements),
      remainingDaysBeforeReset,
      remainingDaysBeforeImproving,
    });
  }

  static computeRemainingDaysBeforeReset(knowledgeElements) {
    const daysSinceLastKnowledgeElement = KnowledgeElement.computeDaysSinceLastKnowledgeElement(knowledgeElements);
    const remainingDaysToWait = Math.ceil(MINIMUM_DELAY_IN_DAYS_FOR_RESET - daysSinceLastKnowledgeElement);

    return remainingDaysToWait > 0 ? remainingDaysToWait : 0;
  }

  static computeRemainingDaysBeforeImproving(knowledgeElements) {
    const daysSinceLastKnowledgeElement = KnowledgeElement.computeDaysSinceLastKnowledgeElement(knowledgeElements);
    const remainingDaysToWait = Math.ceil(MINIMUM_DELAY_IN_DAYS_BEFORE_IMPROVING - daysSinceLastKnowledgeElement);

    return remainingDaysToWait > 0 ? remainingDaysToWait : 0;
  }

  get isFinishedWithMaxLevel() {
    return this.isFinished && this.isMaxLevel;
  }

  get isFinished() {
    return this.status === statuses.COMPLETED;
  }

  get isMaxLevel() {
    return this.level >= this.maxReachableLevel;
  }

  get isNotStarted() {
    return this.status === statuses.NOT_STARTED;
  }

  get isStarted() {
    return this.status === statuses.STARTED;
  }

  get isProgressable() {
    return this.isStarted && !this.isMaxLevel;
  }

  get isImprovable() {
    return this.isFinished && !this.isFinishedWithMaxLevel && this.remainingDaysBeforeImproving === 0;
  }

  get shouldWaitBeforeImproving() {
    return this.isFinished && !this.isFinishedWithMaxLevel && this.remainingDaysBeforeImproving > 0;
  }

  get isResettable() {
    return (this.isFinished || this.isStarted) && this.remainingDaysBeforeReset == 0;
  }

  get hasNotEarnedAnything() {
    return this.earnedPix === 0;
  }

  get hasNotReachedLevelOne() {
    return this.level < 1;
  }

  get hasReachedAtLeastLevelOne() {
    return this.level >= 1;
  }

  get percentageAheadOfNextLevel() {
    return (this.pixScoreAheadOfNextLevel / PIX_COUNT_BY_LEVEL) * 100;
  }

  get remainingPixToNextLevel() {
    return PIX_COUNT_BY_LEVEL - this.pixScoreAheadOfNextLevel;
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

Scorecard.statuses = statuses;

export { Scorecard };
