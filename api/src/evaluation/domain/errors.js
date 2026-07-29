import { DomainError } from '../../shared/domain/errors.js';

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

class AcquiredBadgeForbiddenUpdateError extends DomainError {
  constructor(message = "Il est interdit de modifier un critère d'un badge déjà acquis par un utilisateur.") {
    super(message);
  }
}

class AnswerEvaluationError extends DomainError {
  constructor(challenge) {
    super(`Problème lors de l'évaluation de la réponse du challenge: "${challenge.id}"`, '', challenge);
  }
}

class AlreadyRatedAssessmentError extends DomainError {
  constructor(message = 'Assessment is already rated.') {
    super(message);
  }
}

class AcquiredBadgeForbiddenDeletionError extends DomainError {
  constructor(message = 'Il est interdit de supprimer un badge déjà acquis par un utilisateur.') {
    super(message);
  }
}

class CertificationBadgeForbiddenDeletionError extends DomainError {
  constructor(message = 'Il est interdit de supprimer un badge lié à une certification.') {
    super(message);
  }
}

export {
  AcquiredBadgeForbiddenDeletionError,
  AcquiredBadgeForbiddenUpdateError,
  AlreadyRatedAssessmentError,
  AnswerEvaluationError,
  CertificationBadgeForbiddenDeletionError,
  CompetenceResetError,
  ImproveCompetenceEvaluationForbiddenError,
};
