import { DomainError } from '../../shared/domain/errors.js';

class StageWithLinkedCampaignError extends DomainError {
  constructor() {
    super('The stage is part of a target profile linked to a campaign');
  }
}

class EmptyAnswerError extends DomainError {
  constructor(message = 'The answer value cannot be empty', code = 'ANSWER_CANNOT_BE_EMPTY') {
    super(message, code);
  }
}

class ImproveCompetenceEvaluationForbiddenError extends DomainError {
  constructor(message = 'Le niveau maximum est déjà atteint pour cette compétence.') {
    super(message);
    this.code = 'IMPROVE_COMPETENCE_EVALUATION_FORBIDDEN';
  }
}

class CompetenceResetError extends DomainError {
  constructor(remainingDaysBeforeReset) {
    super(`Il reste ${remainingDaysBeforeReset} jours avant de pouvoir réinitiliser la compétence.`);
  }
}

export {
  CompetenceResetError,
  EmptyAnswerError,
  ImproveCompetenceEvaluationForbiddenError,
  StageWithLinkedCampaignError,
};
