import { DomainError } from '../../shared/domain/errors.js';

class ActivityNotFoundError extends DomainError {
  constructor(message = 'Error, activity not found.', code) {
    super(message);
    this.code = code;
  }
}

class SchoolNotFoundError extends DomainError {
  constructor(message = 'Error, School not found.', code) {
    super(message);
    this.code = code;
  }
}

class MissionNotFoundError extends DomainError {
  constructor(missionId) {
    super(`Mission not found for mission id ${missionId}`);
    this.code = missionId;
  }
}

class NotInProgressAssessmentError extends DomainError {
  constructor(assessmentId) {
    super(`Mission assessment closed for ${assessmentId}`);
    this.code = assessmentId;
  }
}

export { ActivityNotFoundError, MissionNotFoundError, NotInProgressAssessmentError, SchoolNotFoundError };
