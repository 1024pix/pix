import { DomainError } from '../../shared/domain/errors.js';

class ActivityNotFoundError extends DomainError {
  constructor(message = 'Erreur, activitée introuvable.', code) {
    super(message);
    this.code = code;
  }
}

class SchoolNotFoundError extends DomainError {
  constructor(message = 'Erreur, École introuvable.', code) {
    super(message);
    this.code = code;
  }
}

class MissionNotFoundError extends DomainError {
  constructor(missionId) {
    super(`Il n'existe pas de mission ayant pour id ${missionId}`);
    this.code = missionId;
  }
}

class NotInProgressAssessmentError extends DomainError {
  constructor(assessmentId) {
    super(`Ce passage de mission est terminé : ${assessmentId}`);
    this.code = assessmentId;
  }
}

export { ActivityNotFoundError, SchoolNotFoundError, MissionNotFoundError, NotInProgressAssessmentError };
