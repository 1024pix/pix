import { DomainError } from '../../../shared/domain/errors.js';

export class CertificationCandidateForbiddenDeletionError extends DomainError {
  constructor(message = 'Il est interdit de supprimer un candidat de certification déjà lié à un utilisateur.') {
    super(message);
  }
}

export class SessionStartedDeletionError extends DomainError {
  constructor(message = 'La session a déjà commencé.') {
    super(message);
    this.code = 'SESSION_STARTED_DELETION_ERROR';
  }
}

export class UnknownCountryForStudentEnrolmentError extends DomainError {
  constructor(
    { firstName, lastName },
    message = `L'élève ${firstName} ${lastName} a été inscrit avec un code pays de naissance invalide. Veuillez corriger ses informations sur l'espace PixOrga de l'établissement ou contacter le support Pix`,
  ) {
    super(message);
  }
}

export class InvalidCertificationCandidate extends DomainError {
  constructor({ message = 'Candidat de certification invalide.', error }) {
    super(message);
    this.key = error.key;
    this.why = error.why;
  }

  static fromJoiErrorDetail(errorDetail) {
    const error = {};
    error.key = errorDetail.context.key;
    error.why = null;
    const type = errorDetail.type;
    const value = errorDetail.context.value;
    const allowedValues = errorDetail.context.valids;

    if (type === 'any.required') {
      error.why = 'required';
    }
    if (type === 'date.format') {
      error.why = 'date_format';
    }
    if (type === 'date.base') {
      error.why = 'not_a_date';
    }
    if (type === 'string.email') {
      error.why = 'email_format';
    }
    if (type === 'string.base') {
      error.why = 'not_a_string';
    }
    if (type === 'number.base' || type === 'number.integer') {
      error.why = 'not_a_number';
    }
    if (type === 'any.only' && error.key === 'sex') {
      error.why = 'not_a_sex_code';
    }
    if (type === 'any.only' && error.key === 'billingMode') {
      if (allowedValues.length === 1 && allowedValues[0] === null) {
        error.why = 'billing_mode_not_null';
      } else {
        error.why = value !== null ? 'not_a_billing_mode' : 'required';
      }
    }
    if (type === 'any.only' && error.key === 'prepaymentCode') {
      if (allowedValues.length === 1 && allowedValues[0] === null) {
        error.why = 'prepayment_code_not_null';
      }
    }
    if (type === 'any.required' && error.key === 'prepaymentCode') {
      error.why = 'prepayment_code_null';
    }
    if (type === 'number.less' || type === 'number.min') {
      error.why = 'extra_time_percentage_out_of_range';
    }
    if (type === 'date.greater') {
      error.why = 'birthdate_must_be_greater';
    }

    return new InvalidCertificationCandidate({ error });
  }
}

export class CannotEnrollCandidateIndividuallyError extends DomainError {
  constructor(message = "La session a été finalisée ou a expiré, l'ajout de candidat n'est plus possible.") {
    super(message);
    this.code = 'INDIVIDUAL_ENROL_NOT_ALLOWED';
  }
}

export class CannotEnrollScoCandidateError extends DomainError {
  constructor(message = "La session a été finalisée ou a expiré, l'ajout de candidat n'est plus possible.") {
    super(message);
    this.code = 'SCO_ENROL_NOT_ALLOWED';
  }
}
