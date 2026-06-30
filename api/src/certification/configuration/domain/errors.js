import { DomainError } from '../../../shared/domain/errors.js';

export class InvalidScoWhitelistError extends DomainError {
  constructor(meta) {
    super('La liste blanche contient des données invalides.', 'CERTIFICATION_INVALID_SCO_WHITELIST_ERROR', meta);
  }
}

export class InvalidBadgeLevelError extends DomainError {
  constructor(message = 'Badge level inconsistency') {
    super(message);
    this.code = 'INVALID_BADGE_LEVEL';
  }
}

export class CertificationVersionForbiddenDeletionError extends DomainError {
  constructor() {
    super('Il est interdit de supprimer une version de référentiel de certification qui a déjà été activée.');
  }
}

export class CertificationVersionDraftAlreadyExistError extends DomainError {
  constructor() {
    super("Il est interdit de créer une nouvelle version lorsqu'il y en a déjà une en cours d'édition");
  }
}

export class ActiveCertificationInfoNotFound extends DomainError {
  constructor(framework) {
    super(`Certification info for active version of framework "${framework}" not found`);
  }
}
