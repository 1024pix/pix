import { DomainError } from '../../../lib/domain/errors.js';

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

export { ActivityNotFoundError, SchoolNotFoundError, MissionNotFoundError };
