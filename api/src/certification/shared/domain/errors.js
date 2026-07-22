import { DomainError } from '../../../shared/domain/errors.js';

class CertificationCandidateNotFoundError extends DomainError {
  constructor(message = 'No candidate found') {
    super(message);
    this.code = 'CANDIDATE_NOT_FOUND';
  }
}

class CertificationCourseUpdateError extends DomainError {
  constructor(message = 'Échec lors la création ou de la mise à jour du test de certification.') {
    super(message);
  }
}
class InvalidCertificationReportForFinalization extends DomainError {
  constructor(message = 'Échec lors de la validation du certification course') {
    super(message);
  }
}

class CenterHabilitationError extends DomainError {
  constructor({
    message = 'This certification center has no habilitation for the given complementary certification.',
    meta,
  } = {}) {
    super(message);
    this.code = 'CENTER_HABILITATION_ERROR';
    this.meta = meta;
  }
}

class CsvWithNoSessionDataError extends DomainError {
  constructor(message = 'No session data in csv') {
    super(message);
    this.code = 'CSV_DATA_REQUIRED';
  }
}

export {
  CenterHabilitationError,
  CertificationCandidateNotFoundError,
  CertificationCourseUpdateError,
  CsvWithNoSessionDataError,
  InvalidCertificationReportForFinalization,
};
