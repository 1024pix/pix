import { DomainError } from '../../../shared/domain/errors.js';

class MoreThanOneMatchingCertificationError extends DomainError {
  constructor(message = 'More than one candidate found for current search parameters') {
    super(message);
  }
}

class NoCertificationResultForDivision extends DomainError {
  constructor(message = 'Aucun résultat de certification pour cette classe.') {
    super(message);
  }
}

class CertificateGenerationError extends DomainError {
  constructor(message = 'An error has occurred during PDF generation') {
    super(message);
  }
}

class NoCertificationResultsToDownloadError extends DomainError {
  constructor(
    message = 'No published session with certification results to download.',
    code = 'NO_CERTIFICATION_RESULTS_TO_DOWNLOAD',
  ) {
    super(message, code);
  }
}

export {
  CertificateGenerationError,
  MoreThanOneMatchingCertificationError,
  NoCertificationResultForDivision,
  NoCertificationResultsToDownloadError,
};
