class DomainError extends Error {
  constructor(message) {
    super(message);
  }
}

class AlreadyExistingMembershipError extends DomainError {
  constructor(message = 'Le membership existe déjà.') {
    super(message);
  }
}

class AlreadyExistingOrganizationInvitationError extends DomainError {
  constructor(message = 'L\'invitation de l\'organisation existe déjà.') {
    super(message);
  }
}

class AlreadyRatedAssessmentError extends DomainError {
  constructor(message = 'Cette évaluation a déjà été évaluée.') {
    super(message);
  }
}

class AlreadyRegisteredEmailError extends DomainError {
  constructor(message = 'Cet email est déjà utilisé.') {
    super(message);
  }
}

class AlreadyRegisteredUsernameError extends DomainError {
  constructor(message = 'Cet identifiant est déjà utilisé.') {
    super(message);
  }
}

class AlreadyExistingCampaignParticipationError extends DomainError {
  constructor(message = 'Une participation à cette campagne existe déjà.') {
    super(message);
  }
}

class AlreadySharedCampaignParticipationError extends DomainError {
  constructor(message = 'Ces résultats de campagne ont déjà été partagés.') {
    super(message);
  }
}

class StudentsCouldNotBeSavedError extends DomainError {
  constructor(message = 'Une erreur est survenue durant le traitement. Veuillez réessayer ou contacter le support via l\'adresse support@pix.fr') {
    super(message);
  }
}

class SameNationalStudentIdInOrganizationError extends DomainError {
  constructor(errorDetail) {
    let message = 'Un INE est déjà présent pour cette organisation.';
    let nationalStudentId;
    const regex = /([a-zA-Z0-9]+)\)/;
    if (errorDetail) {
      const regexMatches = errorDetail.match(regex);
      nationalStudentId = regexMatches[1];
      message = `L’INE ${nationalStudentId} est déjà présent pour cette organisation.`;
    }

    super(message);
    this.nationalStudentId = errorDetail ? nationalStudentId : null;
  }
}

class SameNationalStudentIdInFileError extends DomainError {
  constructor(nationalStudentId) {
    const message = nationalStudentId ?
      `L’INE ${nationalStudentId} est présent plusieurs fois dans le fichier. La base SIECLE doit être corrigée pour supprimer les doublons. Réimportez ensuite le nouveau fichier.` :
      'Un INE est présent plusieurs fois dans le fichier. La base SIECLE doit être corrigée pour supprimer les doublons. Réimportez ensuite le nouveau fichier.';
    super(message);
  }
}

class UserNotAuthorizedToUpdateCampaignError extends DomainError {
  constructor(message = 'Cet utilisateur n\'est pas autorisé à modifier cette campagne.') {
    super(message);
  }
}

class UserNotAuthorizedToCreateCampaignError extends DomainError {
  constructor(message = 'Cet utilisateur n\'est pas autorisé à créer une campagne.') {
    super(message);
  }
}

class UserNotAuthorizedToUpdateResourceError extends DomainError {
  constructor(message = 'Cet utilisateur n\'est pas autorisé à mettre à jour la ressource.') {
    super(message);
  }
}

class UserNotAuthorizedToGetCampaignResultsError extends DomainError {
  constructor(message = 'Cet utilisateur n\'est pas autorisé à récupérer les résultats de la campagne.') {
    super(message);
  }
}

class UserNotAuthorizedToGetCertificationCoursesError extends DomainError {
  constructor(message = 'Cet utilisateur n\'est pas autorisé à récupérer ces certification courses.') {
    super(message);
  }
}

class CertificationCourseUpdateError extends DomainError {
  constructor(message = 'Echec lors la création ou de la mise à jour du test de certification.') {
    super(message);
  }
}

class InvalidCertificationReportForFinalization extends DomainError {
  constructor(message = 'Echec lors de la validation du certification course') {
    super(message);
  }
}

class CampaignWithoutOrganizationError extends DomainError {
  constructor(message = 'L\'organisation de la campagne n\'a pas été trouvée.') {
    super(message);
  }
}

class CompetenceResetError extends DomainError {
  constructor(remainingDaysBeforeReset) {
    super(`Il reste ${remainingDaysBeforeReset} jours avant de pouvoir réinitiliser la compétence.`);
  }
}

class AssessmentEndedError extends DomainError {
  constructor(message = 'Evaluation terminée.') {
    super(message);
  }

  getErrorMessage() {
    return {
      data: {
        error: ['L\'évaluation est terminée. Nous n\'avons plus de questions à vous poser.'],
      },
    };
  }
}

class CampaignCodeError extends DomainError {
  constructor(message = 'Le code campagne n\'existe pas.') {
    super(message);
  }
}

class CertificationCandidateAlreadyLinkedToUserError extends DomainError {
  constructor(message = 'Ce candidat de certification a déjà été lié à un utilisateur.') {
    super(message);
  }
}
class CertificationCandidateByPersonalInfoNotFoundError extends DomainError {
  constructor(message = 'Aucun candidat de certification n\'a été trouvé avec ces informations.') {
    super(message);
  }
}

class CertificationCandidateByPersonalInfoTooManyMatchesError extends DomainError {
  constructor(message = 'Plus d\'un candidat de certification a été trouvé avec ces informations.') {
    super(message);
  }
}

class CertificationCandidateCreationOrUpdateError extends DomainError {
  constructor(message = 'Echec lors la création ou de la mise à jour du candidat de certification.') {
    super(message);
  }
}

class CertificationCandidateDeletionError extends DomainError {
  constructor(message = 'Echec lors de la suppression du candidat de certification.') {
    super(message);
  }
}

class CertificationCandidateMultipleUserLinksWithinSessionError extends DomainError {
  constructor(message = 'Il est interdit de lier un utilisateur à plusieurs candidats de certification au sein d\'une même session.') {
    super(message);
  }
}

class CertificationCandidatePersonalInfoFieldMissingError extends DomainError {
  constructor(message = 'Information obligatoire manquante du candidat de certification.') {
    super(message);
  }
}

class CertificationCandidatePersonalInfoWrongFormat extends DomainError {
  constructor(message = 'Information transmise par le candidat de certification au mauvais format.') {
    super(message);
  }
}

class CertificationCandidateForbiddenDeletionError extends DomainError {
  constructor(message = 'Il est interdit de supprimer un candidat de certification déjà lié à un utilisateur.') {
    super(message);
  }
}

class CertificationComputeError extends DomainError {
  constructor(message = 'Erreur lors du calcul de la certification.') {
    super(message);
  }
}

class CertificationCenterMembershipCreationError extends DomainError {
  constructor(message = 'Erreur lors de la création du membership de centre de certification.') {
    super(message);
  }
}

class ChallengeAlreadyAnsweredError extends DomainError {
  constructor(message = 'La question a déjà été répondue.') {
    super(message);
  }
}

class EntityValidationError extends DomainError {
  constructor({ invalidAttributes }) {
    super('Echec de validation de l\'entité.');
    this.invalidAttributes = invalidAttributes;
  }

  static fromJoiErrors(joiErrors) {
    const invalidAttributes = joiErrors.map((error) => {
      return { attribute: error.context.key, message: error.message };
    });
    return new EntityValidationError({ invalidAttributes });
  }

  static fromMultipleEntityValidationErrors(entityValidationErrors) {
    const invalidAttributes = entityValidationErrors.reduce(
      (invalidAttributes, entityValidationError) => {
        invalidAttributes.push(...entityValidationError.invalidAttributes);
        return invalidAttributes;
      },
      []);
    return new EntityValidationError({ invalidAttributes });
  }
}

class ForbiddenAccess extends DomainError {
  constructor(message = 'Accès non autorisé.') {
    super(message);
  }
}

class InvalidCertificationCandidate extends DomainError {
  constructor(message = 'Candidat de certification invalide.') {
    super(message);
  }
}

class InvalidRecaptchaTokenError extends DomainError {
  constructor(message = 'Token de recaptcha invalide.') {
    super(message);
  }
}

class InvalidTemporaryKeyError extends DomainError {
  constructor(message = 'Demande de réinitialisation invalide.') {
    super(message);
  }

  getErrorMessage() {
    return {
      data: {
        temporaryKey: ['Cette demande de réinitialisation n’est pas valide.'],
      },
    };
  }
}

class MembershipCreationError extends DomainError {
  constructor(message = 'Erreur lors de la création du membership à une organisation.') {
    super(message);
  }
}

class MembershipUpdateError extends DomainError {
  constructor(message = 'Erreur lors de la mise à jour du membership à une organisation.') {
    super(message);
  }
}

class MissingOrInvalidCredentialsError extends DomainError {
  constructor(message = 'Missing or invalid credentials') {
    super(message);
  }
}

class AssessmentNotCompletedError extends DomainError {
  constructor(message = 'Cette évaluation n\'est pas terminée.') {
    super(message);
  }
}

class NotFoundError extends DomainError {
  constructor(message = 'Erreur, ressource introuvable.') {
    super(message);
  }
}

class ObjectValidationError extends DomainError {
  constructor(message = 'Erreur, objet non valide.') {
    super(message);
  }
}

class OrganizationStudentAlreadyLinkedToUserError extends DomainError {
  constructor(message = 'L\'élève est déjà rattaché à un compte utilisateur.') {
    super(message);
  }
}

class FileValidationError extends DomainError {
  constructor(message = 'Erreur, fichier non valide.') {
    super(message);
  }
}

class PasswordNotMatching extends DomainError {
  constructor(message = 'Mauvais mot de passe.') {
    super(message);
  }
}

class PasswordResetDemandNotFoundError extends DomainError {
  constructor(message = 'La demande de réinitialisation de mot de passe n\'existe pas.') {
    super(message);
  }

  getErrorMessage() {
    return {
      data: {
        temporaryKey: ['Cette demande de réinitialisation n’existe pas.'],
      },
    };
  }
}

class SessionAlreadyFinalizedError extends DomainError {
  constructor(message = 'Erreur, tentatives de finalisation multiples de la session.') {
    super(message);
  }
}

class UserAlreadyLinkedToCandidateInSessionError extends DomainError {
  constructor(message = 'Cet utilisateur est déjà lié à un candidat de certification au sein de cette session.') {
    super(message);
  }
}

class CampaignAlreadyArchivedError extends DomainError {
  constructor(message = 'Cette campagne est déjà archivée.') {
    super(message);
  }
}

class UserNotAuthorizedToAccessEntity extends DomainError {
  constructor(message = 'User is not authorized to access ressource') {
    super(message);
  }
}

class UserNotAuthorizedToCertifyError extends DomainError {
  constructor(message = 'User is not certifiable') {
    super(message);
  }

  getErrorMessage() {
    return {
      data: {
        authorization: ['Vous n’êtes pas autorisé à passer un test de certification.'],
      },
    };
  }
}

class UserNotAuthorizedToUpdateStudentPasswordError extends DomainError {
  constructor(message = 'Cet utilisateur n\'est pas autorisé à mettre à jour le mot de passe de l\'étudiant.') {
    super(message);
  }
}

class UserNotFoundError extends NotFoundError {
  constructor(message = 'Ce compte est introuvable.') {
    super(message);
  }

  getErrorMessage() {
    return {
      data: {
        id: ['Ce compte est introuvable.'],
      },
    };
  }
}

class WrongDateFormatError extends DomainError {
  constructor(message = 'Format de date invalide.') {
    super(message);
  }

  getErrorMessage() {
    return {
      data: {
        date: ['Veuillez renseigner une date de session au format (jj/mm/yyyy).'],
      },
    };
  }
}

/**
 * @deprecated use InfrastructureError instead for unexpected internal errors
 */
class InternalError extends DomainError {
  constructor() {
    super();
    this.errorStack = [
      'Une erreur interne est survenue.',
    ];
  }

  getErrorMessage() {
    return {
      data: {
        error: this.errorStack,
      },
    };
  }
}

module.exports = {
  DomainError,
  AlreadyExistingCampaignParticipationError,
  AlreadyExistingMembershipError,
  AlreadyExistingOrganizationInvitationError,
  AlreadyRatedAssessmentError,
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
  AlreadySharedCampaignParticipationError,
  AssessmentEndedError,
  AssessmentNotCompletedError,
  CampaignAlreadyArchivedError,
  CampaignCodeError,
  CampaignWithoutOrganizationError,
  CertificationCandidateForbiddenDeletionError,
  CertificationCandidateAlreadyLinkedToUserError,
  CertificationCandidateByPersonalInfoNotFoundError,
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CertificationCandidateCreationOrUpdateError,
  CertificationCandidateDeletionError,
  CertificationCandidateMultipleUserLinksWithinSessionError,
  CertificationCandidatePersonalInfoFieldMissingError,
  CertificationCandidatePersonalInfoWrongFormat,
  CertificationCenterMembershipCreationError,
  CertificationComputeError,
  CertificationCourseUpdateError,
  ChallengeAlreadyAnsweredError,
  CompetenceResetError,
  EntityValidationError,
  FileValidationError,
  ForbiddenAccess,
  InternalError,
  InvalidCertificationCandidate,
  InvalidCertificationReportForFinalization,
  InvalidRecaptchaTokenError,
  InvalidTemporaryKeyError,
  MembershipCreationError,
  MembershipUpdateError,
  MissingOrInvalidCredentialsError,
  NotFoundError,
  ObjectValidationError,
  OrganizationStudentAlreadyLinkedToUserError,
  PasswordNotMatching,
  PasswordResetDemandNotFoundError,
  SameNationalStudentIdInFileError,
  SameNationalStudentIdInOrganizationError,
  SessionAlreadyFinalizedError,
  StudentsCouldNotBeSavedError,
  UserAlreadyLinkedToCandidateInSessionError,
  UserNotAuthorizedToAccessEntity,
  UserNotAuthorizedToCertifyError,
  UserNotAuthorizedToCreateCampaignError,
  UserNotAuthorizedToGetCampaignResultsError,
  UserNotAuthorizedToGetCertificationCoursesError,
  UserNotAuthorizedToUpdateCampaignError,
  UserNotAuthorizedToUpdateResourceError,
  UserNotAuthorizedToUpdateStudentPasswordError,
  UserNotFoundError,
  WrongDateFormatError,
};
