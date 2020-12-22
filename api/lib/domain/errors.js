class DomainError extends Error {
  constructor(message, code, meta) {
    super(message);
    this.code = code ;
    this.meta = meta ;
  }
}

class AlreadyExistingEntityError extends DomainError {
  constructor(message = 'L’entité existe déjà.') {
    super(message);
  }
}

class AlreadyExistingMembershipError extends DomainError {
  constructor(message = 'Le membership existe déjà.') {
    super(message);
  }
}

class AuthenticationMethodNotFoundError extends DomainError {
  constructor(message = 'Authentication method not found.') {
    super(message);
  }
}

class OrganizationNotFoundError extends DomainError {
  constructor(message = 'Organisation non trouvée.') {
    super(message);
  }
}

class OrganizationWithoutEmailError extends DomainError {
  constructor(message = 'Organisation sans email renseigné.') {
    super(message);
  }
}

class ManyOrganizationsFoundError extends DomainError {
  constructor(message = 'Plusieurs organisations ont été retrouvées.') {
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

class AssessmentResultNotCreatedError extends DomainError {
  constructor(message = 'L\'assessment result n\'a pas pu être généré.') {
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

class NoCampaignParticipationForUserAndCampaign extends DomainError {
  constructor(message = 'L\'utilisateur n\'a pas encore participé à la campagne') {
    super(message);
  }
}

class SchoolingRegistrationsCouldNotBeSavedError extends DomainError {
  constructor(message = 'Une erreur est survenue durant le traitement.') {
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

class SameNationalApprenticeIdInOrganizationError extends DomainError {
  constructor(errorDetail) {
    let message = 'Un INA est déjà présent pour cette organisation.';
    let nationalApprenticeId;
    const regex = /([a-zA-Z0-9]+)\)/;
    if (errorDetail) {
      const regexMatches = errorDetail.match(regex);
      nationalApprenticeId = regexMatches[1];
      message = `L’INA ${nationalApprenticeId} est déjà présent pour cette organisation.`;
    }

    super(message);
    this.nationalApprenticeId = errorDetail ? nationalApprenticeId : null;
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

class UserNotAuthorizedToGenerateUsernamePasswordError extends DomainError {
  constructor(message = 'Cet utilisateur n\'est pas autorisé à générer un identifiant et un mot de passe.') {
    super(message);
  }
}

class CertificationCourseUpdateError extends DomainError {
  constructor(message = 'Echec lors la création ou de la mise à jour du test de certification.') {
    super(message);
  }
}

class CertificationCourseNotPublishableError extends DomainError {
  constructor(message = 'Une Certification avec le statut \'started\' ou \'error\' ne peut-être publiée.') {
    super(message);
  }
}

class InvalidCertificationCandidate extends DomainError {
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
    return new InvalidCertificationCandidate({ error });
  }
}

class InvalidCertificationReportForFinalization extends DomainError {
  constructor(message = 'Echec lors de la validation du certification course') {
    super(message);
  }
}

class InvalidCertificationIssueReportForSaving extends DomainError {
  constructor(message = 'Echec lors de la validation du signalement') {
    super(message);
  }
}

class InvalidParametersForSessionPublication extends DomainError {
  constructor(message = 'Echec lors de la publication des résultats de la session, paramètres entrants invalides.') {
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

class CertificateVerificationCodeGenerationTooManyTrials extends DomainError {
  constructor(numberOfTrials) {
    super(`Could not find an available certificate verification code after ${numberOfTrials} trials`);
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

class MatchingReconciledStudentNotFoundError extends DomainError {
  constructor(message = 'Le candidat de certification ne correspond pas à l\'étudiant trouvé avec ces informations.') {
    super(message);
    this.code = 'MATCHING_RECONCILED_STUDENT_NOT_FOUND';
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

class CertificationCandidatesImportError extends DomainError {
  constructor({ message = 'Quelque chose s\'est mal passé. Veuillez réessayer' } = {}) {
    super(message);
  }

  static fromInvalidCertificationCandidateError(error, keyLabelMap, lineNumber) {
    const label = error.key in keyLabelMap ? keyLabelMap[error.key] : 'none';
    const linePortion = `Ligne ${lineNumber} :`;
    let contentPortion = 'Quelque chose s\'est mal passé. Veuillez réessayer';

    if (error.why === 'not_a_date' || error.why === 'date_format') {
      contentPortion = `Le champ “${label}” doit être au format jj/mm/aaaa.`;
    }
    if (error.why === 'email_format') {
      contentPortion = `Le champ “${label}” doit être au format email.`;
    }
    if (error.why === 'not_a_string') {
      contentPortion = `Le champ “${label}” doit être une chaîne de caractères.`;
    }
    if (error.why === 'not_a_number') {
      contentPortion = `Le champ “${label}” doit être un nombre.`;
    }
    if (error.why === 'required') {
      contentPortion = `Le champ “${label}” est obligatoire.`;
    }

    return new CertificationCandidatesImportError({ message: `${linePortion} ${contentPortion}` });
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

class CsvParsingError extends DomainError {
  constructor(message = 'Les données n\'ont pas pu être parsées.') {
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

class ImproveCompetenceEvaluationForbiddenError extends DomainError {
  constructor(message = 'Le niveau maximum est déjà atteint pour cette compétence.') {
    super(message);
  }
}

class InvalidExternalUserTokenError extends DomainError {
  constructor(message = 'L’idToken de l’utilisateur externe est invalide.') {
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

class UnexpectedUserAccount extends DomainError {
  constructor({ message = 'Ce compte utilisateur n\'est pas celui qui est attendu.', code, meta }) {
    super(message);
    this.code = code;
    this.meta = meta;
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

class MissingAssessmentId extends DomainError {
  constructor(message = 'AssessmentId manquant ou incorrect') {
    super(message);
  }
}

class AssessmentNotCompletedError extends DomainError {
  constructor(message = 'Cette évaluation n\'est pas terminée.') {
    super(message);
  }
}

class NotEligibleCandidateError extends DomainError {
  constructor(message = 'Erreur, candidat non éligible à la certification.') {
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

class UserCouldNotBeReconciledError extends DomainError {
  constructor(message = 'Cet utilisateur n\'a pas pu être rattaché à une organisation.') {
    super(message);
  }
}

class UserShouldChangePasswordError extends DomainError {
  constructor(message = 'Erreur, vous devez changer votre mot de passe.') {
    super(message);
  }
}

class SchoolingRegistrationAlreadyLinkedToUserError extends DomainError {
  constructor(message = 'L\'élève est déjà rattaché à un compte utilisateur.', code, meta) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class UserAlreadyExistsWithAuthenticationMethodError extends DomainError {
  constructor(message = 'Il existe déjà un compte qui possède cette méthode d‘authentification.') {
    super(message);
  }
}

class UserNotAuthorizedToCreateResourceError extends DomainError {
  constructor(message = 'Cet utilisateur n\'est pas autorisé à créer la ressource.') {
    super(message);
  }
}

class UserOrgaSettingsCreationError extends DomainError {
  constructor(message = 'Erreur lors de la création des paramètres utilisateur relatifs à Pix Orga.') {
    super(message);
  }
}

class UserNotMemberOfOrganizationError extends DomainError {
  constructor(message = 'L\'utilisateur n\'est pas membre de l\'organisation.') {
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

class TargetProfileInvalidError extends DomainError {
  constructor(message = 'Le profil cible ne possède aucun acquis ciblé.') {
    super(message);
  }
}

class UserAlreadyLinkedToCandidateInSessionError extends DomainError {
  constructor(message = 'Cet utilisateur est déjà lié à un candidat de certification au sein de cette session.') {
    super(message);
  }
}

class ArchivedCampaignError extends DomainError {
  constructor(message = 'Cette campagne est déjà archivée.') {
    super(message);
  }
}

class UserNotAuthorizedToUpdateEmailError extends DomainError {
  constructor(message = 'User is not authorized to update email') {
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

class UserNotAuthorizedToUpdatePasswordError extends DomainError {
  constructor(message = 'L\'utilisateur n\'est pas autorisé à mettre à jour ce mot de passe.') {
    super(message);
  }
}

class SchoolingRegistrationNotFound extends NotFoundError {
  constructor(message = 'Aucune inscription d‘élève n‘a été trouvée.') {
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

class CsvImportError extends DomainError {
  constructor(message = 'Quelque chose s’est mal passé. Veuillez réessayer.') {
    super(message);
  }
}

class NotImplementedError extends Error {
  constructor(message = 'Not implemented error.') {
    super(message);
  }
}

module.exports = {
  AlreadyExistingEntityError,
  AlreadyExistingCampaignParticipationError,
  AlreadyExistingMembershipError,
  AlreadyExistingOrganizationInvitationError,
  AlreadyRatedAssessmentError,
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
  AlreadySharedCampaignParticipationError,
  ArchivedCampaignError,
  AssessmentEndedError,
  AssessmentNotCompletedError,
  AssessmentResultNotCreatedError,
  AuthenticationMethodNotFoundError,
  CampaignCodeError,
  CertificateVerificationCodeGenerationTooManyTrials,
  CertificationCandidateForbiddenDeletionError,
  CertificationCandidateAlreadyLinkedToUserError,
  CertificationCandidateByPersonalInfoNotFoundError,
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CertificationCandidateCreationOrUpdateError,
  CertificationCandidateDeletionError,
  CertificationCandidateMultipleUserLinksWithinSessionError,
  CertificationCandidatePersonalInfoFieldMissingError,
  CertificationCandidatePersonalInfoWrongFormat,
  CertificationCandidatesImportError,
  CertificationCenterMembershipCreationError,
  CertificationComputeError,
  CertificationCourseNotPublishableError,
  CertificationCourseUpdateError,
  ChallengeAlreadyAnsweredError,
  CompetenceResetError,
  CsvImportError,
  CsvParsingError,
  DomainError,
  EntityValidationError,
  FileValidationError,
  ForbiddenAccess,
  ImproveCompetenceEvaluationForbiddenError,
  InvalidCertificationCandidate,
  InvalidCertificationReportForFinalization,
  InvalidCertificationIssueReportForSaving,
  InvalidExternalUserTokenError,
  InvalidParametersForSessionPublication,
  InvalidRecaptchaTokenError,
  InvalidTemporaryKeyError,
  ManyOrganizationsFoundError,
  MatchingReconciledStudentNotFoundError,
  MembershipCreationError,
  MembershipUpdateError,
  MissingAssessmentId,
  MissingOrInvalidCredentialsError,
  NoCampaignParticipationForUserAndCampaign,
  NotEligibleCandidateError,
  NotFoundError,
  NotImplementedError,
  ObjectValidationError,
  OrganizationNotFoundError,
  OrganizationWithoutEmailError,
  PasswordNotMatching,
  PasswordResetDemandNotFoundError,
  SameNationalApprenticeIdInOrganizationError,
  SameNationalStudentIdInFileError,
  SameNationalStudentIdInOrganizationError,
  SchoolingRegistrationAlreadyLinkedToUserError,
  SchoolingRegistrationNotFound,
  SchoolingRegistrationsCouldNotBeSavedError,
  SessionAlreadyFinalizedError,
  TargetProfileInvalidError,
  UnexpectedUserAccount,
  UserAlreadyExistsWithAuthenticationMethodError,
  UserAlreadyLinkedToCandidateInSessionError,
  UserCouldNotBeReconciledError,
  UserNotAuthorizedToAccessEntity,
  UserNotAuthorizedToCertifyError,
  UserNotAuthorizedToCreateCampaignError,
  UserNotAuthorizedToCreateResourceError,
  UserNotAuthorizedToGenerateUsernamePasswordError,
  UserNotAuthorizedToGetCampaignResultsError,
  UserNotAuthorizedToGetCertificationCoursesError,
  UserNotAuthorizedToUpdateCampaignError,
  UserNotAuthorizedToUpdatePasswordError,
  UserNotAuthorizedToUpdateResourceError,
  UserNotFoundError,
  UserNotAuthorizedToUpdateEmailError,
  UserNotMemberOfOrganizationError,
  UserOrgaSettingsCreationError,
  UserShouldChangePasswordError,
  WrongDateFormatError,
};
