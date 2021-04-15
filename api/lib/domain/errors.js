class DomainError extends Error {
  constructor(message, code, meta) {
    super(message);
    this.code = code ;
    this.meta = meta ;
  }
}

class TargetProfileCannotBeCreated extends DomainError {
  constructor(message = 'Erreur lors de la création du profil cible.') {
    super(message);
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

class ApplicationWithInvalidClientIdError extends DomainError {
  constructor(message = 'The client ID or secret are invalid.') {
    super(message);
  }
}

class ApplicationWithInvalidClientSecretError extends DomainError {
  constructor(message = 'The client secret is invalid.') {
    super(message);
  }
}

class ApplicationScopeNotAllowedError extends DomainError {
  constructor(message = 'The scope is invalid.') {
    super(message);
  }
}

class AuthenticationMethodNotFoundError extends DomainError {
  constructor(message = 'Authentication method not found.') {
    super(message);
  }
}

class OrganizationAlreadyExistError extends DomainError {
  constructor(message = 'L\'organisation existe déjà.') {
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
  constructor(message = 'Cette adresse e-mail est déjà utilisée.') {
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
  constructor() {
    super('An error occurred during process');
  }
}

class SameNationalStudentIdInOrganizationError extends DomainError {
  constructor(errorDetail) {
    let message = 'INE already in use for this organization.';
    let nationalStudentId;
    const regex = /([a-zA-Z0-9]+)\)/;
    if (errorDetail) {
      const regexMatches = errorDetail.match(regex);
      nationalStudentId = regexMatches[1];
      message = `The INE ${nationalStudentId} is already in use for this organization.`;
    }

    super(message);
    this.nationalStudentId = errorDetail ? nationalStudentId : null;
  }
}

class SameNationalApprenticeIdInOrganizationError extends DomainError {
  constructor(errorDetail) {
    let message = 'INA is already in use for this organization.';
    let nationalApprenticeId;
    const regex = /([a-zA-Z0-9]+)\)/;
    if (errorDetail) {
      const regexMatches = errorDetail.match(regex);
      nationalApprenticeId = regexMatches[1];
      message = `The INA ${nationalApprenticeId} is already in use for this organization.`;
    }

    super(message);
    this.nationalApprenticeId = errorDetail ? nationalApprenticeId : null;
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
  constructor(message = 'Échec lors la création ou de la mise à jour du test de certification.') {
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
  constructor(message = 'Échec lors de la validation du certification course') {
    super(message);
  }
}

class InvalidCertificationIssueReportForSaving extends DomainError {
  constructor(message = 'Échec lors de la validation du signalement') {
    super(message);
  }
}

class SendingEmailToResultRecipientError extends DomainError {
  constructor(failedEmailsRecipients) {
    super(`Échec lors de l'envoi des résultats au(x) destinataire(s) : ${failedEmailsRecipients.join(', ')}`);
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

class ChallengeToBeNeutralizedNotFoundError extends DomainError {
  constructor() {
    super('La question à neutraliser n\'a pas été posée lors du test de certification');
  }
}

class ChallengeToBeDeneutralizedNotFoundError extends DomainError {
  constructor() {
    super('La question à dé-neutraliser n\'a pas été posée lors du test de certification');
  }
}

class CsvParsingError extends DomainError {
  constructor(message = 'Les données n\'ont pas pu être parsées.') {
    super(message);
  }
}

class EntityValidationError extends DomainError {
  constructor({ invalidAttributes }) {
    super('Échec de validation de l\'entité.');
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

class InvalidPasswordForUpdateEmailError extends DomainError {
  constructor(message = 'Le mot de passe que vous avez saisi est invalide.') {
    super(message);
  }
}

class InvalidResultRecipientTokenError extends DomainError {
  constructor(message = 'Le token de récupération des résultats de la session de certification est invalide.') {
    super(message);
  }
}

class InvalidSessionResultError extends DomainError {
  constructor(message = 'Le token de récupération des résultats de la session de certification est invalide.') {
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

class NoCertificationResultForDivision extends DomainError {
  constructor(message = 'Aucun résultat de certification pour cette classe.') {
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
  constructor(code, meta) {
    super('An error occurred, file is invalid');
    this.code = code;
    this.meta = meta;
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

class SessionAlreadyPublishedError extends DomainError {
  constructor(message = 'La session est déjà publiée.') {
    super(message);
  }
}

class TargetProfileInvalidError extends DomainError {
  constructor(message = 'Le profil cible ne possède aucun acquis ciblé.') {
    super(message);
  }
}

class OrganizationTagNotFound extends DomainError {
  constructor(message = 'Le tag de l’organization n’existe pas.') {
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

class UserNotAuthorizedToAccessEntityError extends DomainError {
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

class UserNotAuthorizedToRemoveAuthenticationMethod extends DomainError {
  constructor(message = 'L\'utilisateur n\'est pas autorisé à supprimer cette méthode de connexion.') {
    super(message);
  }
}

class SchoolingRegistrationNotFound extends NotFoundError {
  constructor(message = 'Aucune inscription d‘élève n‘a été trouvée.') {
    super(message);
  }
}

class UserCantBeCreatedError extends DomainError {
  constructor(message = 'L\'utilisateur ne peut pas être créé') {
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

class UserAccountNotFoundForPoleEmploiError extends DomainError {
  constructor({ message = 'L\'utilisateur n\'a pas de compte Pix', responseCode, authenticationKey }) {
    super(message);
    this.responseCode = responseCode;
    this.authenticationKey = authenticationKey;
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
  constructor(code, meta) {
    super('An error occurred during CSV import');
    this.code = code;
    this.meta = meta;
  }
}

class SiecleXmlImportError extends DomainError {
  constructor(code, meta) {
    super('An error occurred during Siecle XML import');
    this.code = code;
    this.meta = meta;
  }
}

class NotImplementedError extends Error {
  constructor(message = 'Not implemented error.') {
    super(message);
  }
}

class GeneratePoleEmploiTokensError extends DomainError {
  constructor(message, status) {
    super(message);
    this.status = parseInt(status, 10);
    this.title = 'Pole emploi tokens generation fails.';
  }
}

class InvalidMembershipRoleError extends DomainError {
  constructor(message = 'Le rôle du membre est invalide.') {
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
  ApplicationWithInvalidClientIdError,
  ApplicationWithInvalidClientSecretError,
  ApplicationScopeNotAllowedError,
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
  ChallengeToBeNeutralizedNotFoundError,
  ChallengeToBeDeneutralizedNotFoundError,
  CompetenceResetError,
  CsvImportError,
  CsvParsingError,
  DomainError,
  EntityValidationError,
  FileValidationError,
  ForbiddenAccess,
  GeneratePoleEmploiTokensError,
  ImproveCompetenceEvaluationForbiddenError,
  InvalidCertificationCandidate,
  InvalidCertificationReportForFinalization,
  InvalidCertificationIssueReportForSaving,
  InvalidExternalUserTokenError,
  InvalidMembershipRoleError,
  InvalidPasswordForUpdateEmailError,
  InvalidResultRecipientTokenError,
  InvalidSessionResultError,
  InvalidTemporaryKeyError,
  ManyOrganizationsFoundError,
  MatchingReconciledStudentNotFoundError,
  MembershipCreationError,
  MembershipUpdateError,
  MissingAssessmentId,
  MissingOrInvalidCredentialsError,
  NoCampaignParticipationForUserAndCampaign,
  NoCertificationResultForDivision,
  NotEligibleCandidateError,
  NotFoundError,
  NotImplementedError,
  ObjectValidationError,
  OrganizationTagNotFound,
  OrganizationAlreadyExistError,
  OrganizationNotFoundError,
  OrganizationWithoutEmailError,
  PasswordNotMatching,
  PasswordResetDemandNotFoundError,
  SameNationalApprenticeIdInOrganizationError,
  SameNationalStudentIdInOrganizationError,
  SchoolingRegistrationAlreadyLinkedToUserError,
  SchoolingRegistrationNotFound,
  SchoolingRegistrationsCouldNotBeSavedError,
  SendingEmailToResultRecipientError,
  SessionAlreadyFinalizedError,
  SessionAlreadyPublishedError,
  SiecleXmlImportError,
  TargetProfileInvalidError,
  TargetProfileCannotBeCreated,
  UnexpectedUserAccount,
  UserAccountNotFoundForPoleEmploiError,
  UserAlreadyExistsWithAuthenticationMethodError,
  UserAlreadyLinkedToCandidateInSessionError,
  UserCantBeCreatedError,
  UserCouldNotBeReconciledError,
  UserNotAuthorizedToAccessEntityError,
  UserNotAuthorizedToCertifyError,
  UserNotAuthorizedToCreateCampaignError,
  UserNotAuthorizedToCreateResourceError,
  UserNotAuthorizedToGenerateUsernamePasswordError,
  UserNotAuthorizedToGetCampaignResultsError,
  UserNotAuthorizedToGetCertificationCoursesError,
  UserNotAuthorizedToRemoveAuthenticationMethod,
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
