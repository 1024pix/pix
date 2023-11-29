import { DomainError } from '../../../shared/domain/errors.js';

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

export { CertificationCourseUpdateError, InvalidCertificationReportForFinalization };
