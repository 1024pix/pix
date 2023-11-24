import { DomainError } from '../../../shared/domain/errors.js';

class CertificationCourseUpdateError extends DomainError {
  constructor(message = 'Échec lors la création ou de la mise à jour du test de certification.') {
    super(message);
  }
}
export { CertificationCourseUpdateError };
