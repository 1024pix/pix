import { AssessmentEndedError } from '../../src/shared/domain/errors.js';
import { SESSION_SUPERVISING } from './constants/session-supervising.js';

class DomainError extends Error {
  constructor(message, code, meta) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class AnswerEvaluationError extends DomainError {
  constructor(challenge) {
    super(`Problème lors de l'évaluation de la réponse du challenge: "${challenge.id}"`, '', challenge);
  }
}

class AlreadyExistingAdminMemberError extends DomainError {
  constructor(message = 'Cet agent a déjà accès') {
    super(message);
  }
}

class AccountRecoveryDemandNotCreatedError extends DomainError {
  constructor(message = "La demande de récupération de compte n'a pas pu être générée.") {
    super(message);
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

class AuthenticationMethodAlreadyExistsError extends DomainError {
  constructor(message = 'Authentication method already exists.') {
    super(message);
  }
}

class OrganizationAlreadyExistError extends DomainError {
  constructor(message = "L'organisation existe déjà.") {
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

class AlreadyExistingInvitationError extends DomainError {
  constructor(message = "L'invitation de l'organisation existe déjà.") {
    super(message);
  }
}

class AlreadyAcceptedOrCancelledInvitationError extends DomainError {
  constructor(message = "L'invitation a déjà été acceptée ou annulée.") {
    super(message);
  }
}

class AlreadyRatedAssessmentError extends DomainError {
  constructor(message = 'Cette évaluation a déjà été évaluée.') {
    super(message);
  }
}

class AlreadyRegisteredEmailAndUsernameError extends DomainError {
  constructor(message = 'Cette adresse e-mail et cet identifiant sont déjà utilisés.') {
    super(message);
  }
}

class AlreadyRegisteredEmailError extends DomainError {
  constructor(message = 'Cette adresse e-mail est déjà utilisée.', code = 'ACCOUNT_WITH_EMAIL_ALREADY_EXISTS') {
    super(message, code);
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

class CancelledInvitationError extends DomainError {
  constructor(
    message = "L'invitation à cette organisation a été annulée.",
    code = 'CANCELLED_ORGANIZATION_INVITATION_CODE',
  ) {
    super(message, code);
  }
}

class UncancellableOrganizationInvitationError extends DomainError {
  constructor(
    message = "L'invitation à cette organisation ne peut pas être annulée.",
    code = 'UNCANCELLABLE_ORGANIZATION_INVITATION_CODE',
  ) {
    super(message, code);
  }
}

class UncancellableCertificationCenterInvitationError extends DomainError {
  constructor(
    message = "L'invitation à ce centre de certification ne peut pas être annulée.",
    code = 'UNCANCELLABLE_CERTIFICATION_CENTER_INVITATION_CODE',
  ) {
    super(message, code);
  }
}

class CantImproveCampaignParticipationError extends DomainError {
  constructor(message = 'Une campagne de collecte de profils ne peut pas être retentée.') {
    super(message);
  }
}

class CantCalculateCampaignParticipationResultError extends DomainError {
  constructor(message = `Impossible de calculer le résultat de la participation car elle n'a pas été partagée.`) {
    super(message);
  }
}

class NoCampaignParticipationForUserAndCampaign extends DomainError {
  constructor(message = "L'utilisateur n'a pas encore participé à la campagne") {
    super(message);
  }
}

class NoStagesForCampaign extends DomainError {
  constructor(message = 'The campaign does not have stages.') {
    super(message);
  }
}

class AuthenticationKeyExpired extends DomainError {
  constructor(message = 'This authentication key has expired.') {
    super(message);
  }
}

class AccountRecoveryDemandExpired extends DomainError {
  constructor(message = 'This account recovery demand has expired.') {
    super(message);
  }
}

class AccountRecoveryUserAlreadyConfirmEmail extends DomainError {
  constructor(message = 'This user has already a confirmed email.') {
    super(message);
  }
}

class OrganizationLearnersCouldNotBeSavedError extends DomainError {
  constructor(message = 'An error occurred during process') {
    super(message);
  }
}

class OrganizationLearnersConstraintError extends DomainError {
  constructor(message = 'Constraint during inserting organization learners') {
    super(message);
  }
}

class MultipleOrganizationLearnersWithDifferentNationalStudentIdError extends DomainError {
  constructor(message = 'Multiple organization learners with different INE') {
    super(message);
  }
}

class UserNotAuthorizedToUpdateCampaignError extends DomainError {
  constructor(message = "Cet utilisateur n'est pas autorisé à modifier cette campagne.") {
    super(message);
  }
}

class UserNotAuthorizedToCreateCampaignError extends DomainError {
  constructor(message = "Cet utilisateur n'est pas autorisé à créer une campagne.") {
    super(message);
  }
}

class OrganizationNotAuthorizedMultipleSendingAssessmentToCreateCampaignError extends DomainError {
  constructor(organizationId) {
    const message = `L'organisation ${organizationId}, n'est pas autorisée à créer une campagne d'évaluation à envoi multiple.`;
    super(message);
  }
}

class UserNotAuthorizedToUpdateResourceError extends DomainError {
  constructor(message = "Cet utilisateur n'est pas autorisé à mettre à jour la ressource.") {
    super(message);
  }
}

class UserNotAuthorizedToGetCampaignResultsError extends DomainError {
  constructor(message = "Cet utilisateur n'est pas autorisé à récupérer les résultats de la campagne.") {
    super(message);
  }
}

class CampaignTypeError extends DomainError {
  constructor(message = "Ce type de campagne n'est pas autorisé.") {
    super(message);
  }
}

class UserNotAuthorizedToGenerateUsernamePasswordError extends DomainError {
  constructor(message = "Cet utilisateur n'est pas autorisé à générer un identifiant et un mot de passe.") {
    super(message);
  }
}

class UserShouldNotBeReconciledOnAnotherAccountError extends DomainError {
  constructor({ message = "Cet utilisateur n'est pas autorisé à se réconcilier avec ce compte", code, meta }) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class CertificationCourseNotPublishableError extends DomainError {
  constructor(
    sessionId,
    message = `Publication de la session ${sessionId}: Une Certification avec le statut 'started' ou 'error' ne peut-être publiée.`,
  ) {
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

class InvalidCertificationIssueReportForSaving extends DomainError {
  constructor(message = 'Échec lors de la validation du signalement') {
    super(message);
  }
}

class CertificationIssueReportAutomaticallyResolvedShouldNotBeUpdatedManually extends DomainError {
  constructor(message = 'Le signalement ne peut pas être modifié manuellement') {
    super(message);
  }
}

class DeprecatedCertificationIssueReportCategoryError extends DomainError {
  constructor(message = 'La catégorie de signalement choisie est dépréciée.') {
    super(message);
  }
}

class DeprecatedCertificationIssueReportSubcategoryError extends DomainError {
  constructor(message = 'La sous-catégorie de signalement choisie est dépréciée.') {
    super(message);
  }
}

class SendingEmailError extends DomainError {
  constructor() {
    super("Échec lors de l'envoi de l'email.");
    this.code = 'SENDING_EMAIL_FAILED';
  }
}

class SendingEmailToInvalidDomainError extends DomainError {
  constructor(emailAddress) {
    super(`Failed to send email to ${emailAddress} because domain seems to be invalid.`);
    this.code = 'INVALID_EMAIL_DOMAIN';
  }
}

class SendingEmailToInvalidEmailAddressError extends DomainError {
  constructor(emailAddress, errorMessage) {
    super(`Failed to send email to ${emailAddress} because email address seems to be invalid.`);
    this.code = 'INVALID_EMAIL_ADDRESS_FORMAT';
    this.meta = {
      emailAddress,
      errorMessage,
    };
  }
}

class SendingEmailToRefererError extends DomainError {
  constructor(failedEmailReferers) {
    super(
      `Échec lors de l'envoi du mail au(x) référent(s) du centre de certification : ${failedEmailReferers.join(', ')}`,
    );
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

class NotEnoughDaysPassedBeforeResetCampaignParticipationError extends DomainError {
  constructor() {
    super(`Il n'est pas possible de remettre à zéro votre parcours pour le moment.`);
  }
}

class CampaignCodeError extends DomainError {
  constructor(message = "Le code campagne n'existe pas.") {
    super(message);
  }
}

class CertificateVerificationCodeGenerationTooManyTrials extends DomainError {
  constructor(numberOfTrials) {
    super(`Could not find an available certificate verification code after ${numberOfTrials} trials`);
  }
}

class CertificationEndedBySupervisorError extends DomainError {
  constructor(message = 'Le surveillant a mis fin à votre test de certification.') {
    super(message);
  }
}

class CertificationEndedByFinalizationError extends DomainError {
  constructor(message = 'La session a été finalisée par votre centre de certification.') {
    super(message);
  }
}

class SupervisorAccessNotAuthorizedError extends DomainError {
  constructor(
    message = "Cette session est organisée dans un centre de certification pour lequel l'espace surveillant n'a pas été activé par Pix.",
  ) {
    super(message);
  }
}

class CertificationCandidateOnFinalizedSessionError extends DomainError {
  constructor(message = "Cette session a déjà été finalisée, l'ajout de candidat n'est pas autorisé") {
    super(message);
  }
}

class CertificationCandidateAlreadyLinkedToUserError extends DomainError {
  constructor(message = 'At least one candidate is already linked to a user.') {
    super(message);
    this.code = 'SESSION_STARTED_CANDIDATE_ALREADY_LINKED_TO_USER';
  }
}

class CertificationCandidateByPersonalInfoNotFoundError extends DomainError {
  constructor(message = "Aucun candidat de certification n'a été trouvé avec ces informations.") {
    super(message);
  }
}

class CertificationCandidateNotFoundError extends DomainError {
  constructor(message = 'No candidate found') {
    super(message);
    this.code = 'CANDIDATE_NOT_FOUND';
  }
}

class MatchingReconciledStudentNotFoundError extends DomainError {
  constructor(message = "Le candidat de certification ne correspond pas à l'étudiant trouvé avec ces informations.") {
    super(message);
    this.code = 'MATCHING_RECONCILED_STUDENT_NOT_FOUND';
  }
}

class CertificationCandidateByPersonalInfoTooManyMatchesError extends DomainError {
  constructor(message = "Plus d'un candidat de certification a été trouvé avec ces informations.") {
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
  constructor(
    message = "Il est interdit de lier un utilisateur à plusieurs candidats de certification au sein d'une même session.",
  ) {
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

class CertificationCandidatesError extends DomainError {
  constructor({ message = "Quelque chose s'est mal passé. Veuillez réessayer", code = null, meta = null } = {}) {
    super(message, code, meta);
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

class CertificationCenterMembershipDisableError extends DomainError {
  constructor(message = 'Erreur lors de la mise à jour du membership de centre de certification.') {
    super(message);
  }
}

class ChallengeAlreadyAnsweredError extends DomainError {
  constructor(message = 'La question a déjà été répondue.') {
    super(message);
  }
}

class ChallengeNotAskedError extends DomainError {
  constructor(message = 'La question à laquelle vous essayez de répondre ne vous a pas été proposée.') {
    super(message);
  }
}

class ChallengeToBeNeutralizedNotFoundError extends DomainError {
  constructor() {
    super("La question à neutraliser n'a pas été posée lors du test de certification");
  }
}

class ChallengeToBeDeneutralizedNotFoundError extends DomainError {
  constructor() {
    super("La question à dé-neutraliser n'a pas été posée lors du test de certification");
  }
}

class CsvParsingError extends DomainError {
  constructor(message = "Les données n'ont pas pu être parsées.") {
    super(message);
  }
}

class ImproveCompetenceEvaluationForbiddenError extends DomainError {
  constructor(message = 'Le niveau maximum est déjà atteint pour cette compétence.') {
    super(message);
  }
}

class InvalidPasswordForUpdateEmailError extends DomainError {
  constructor(message = 'Le mot de passe que vous avez saisi est invalide.') {
    super(message);
  }
}

class MissingUserAccountError extends DomainError {
  constructor(message = 'Les informations de compte requises sont manquantes') {
    super(message);
  }
}

class UnexpectedUserAccountError extends DomainError {
  constructor({
    message = "Ce compte utilisateur n'est pas celui qui est attendu.",
    code = 'UNEXPECTED_USER_ACCOUNT',
    meta,
  }) {
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

class MissingAttributesError extends DomainError {
  constructor(message = 'Attributs manquants.') {
    super(message);
  }
}

class AssessmentNotCompletedError extends DomainError {
  constructor(message = "Cette évaluation n'est pas terminée.") {
    super(message);
  }
}

class NotEligibleCandidateError extends DomainError {
  constructor(message = 'Erreur, candidat non éligible à la certification.') {
    super(message);
  }
}

class NotFoundError extends DomainError {
  constructor(message = 'Erreur, ressource introuvable.', code) {
    super(message);
    this.code = code;
  }
}

class DeletedError extends DomainError {
  constructor(message = 'Erreur, ressource supprimée.', code) {
    super(message);
    this.code = code;
  }
}

class ObjectValidationError extends DomainError {
  constructor(message = 'Erreur, objet non valide.') {
    super(message);
  }
}

class OrganizationArchivedError extends DomainError {
  constructor(message = "L'organisation est archivée.") {
    super(message);
  }
}

class UserCouldNotBeReconciledError extends DomainError {
  constructor(message = "Cet utilisateur n'a pas pu être rattaché à une organisation.") {
    super(message);
  }
}

class OrganizationLearnerAlreadyLinkedToUserError extends DomainError {
  constructor(message = "L'élève est déjà rattaché à un compte utilisateur.", code, meta) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class OrganizationLearnerAlreadyLinkedToInvalidUserError extends DomainError {
  constructor(message = 'Élève rattaché avec un compte invalide.') {
    super(message);
  }
}

class UserAlreadyExistsWithAuthenticationMethodError extends DomainError {
  constructor(message = 'Il existe déjà un compte qui possède cette méthode d‘authentification.') {
    super(message);
  }
}

class UserNotAuthorizedToCreateResourceError extends DomainError {
  constructor(message = "Cet utilisateur n'est pas autorisé à créer la ressource.") {
    super(message);
  }
}

class UserOrgaSettingsCreationError extends DomainError {
  constructor(message = 'Erreur lors de la création des paramètres utilisateur relatifs à Pix Orga.') {
    super(message);
  }
}

class UserNotMemberOfOrganizationError extends DomainError {
  constructor(message = "L'utilisateur n'est pas membre de l'organisation.") {
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

class PasswordResetDemandNotFoundError extends DomainError {
  constructor(message = "La demande de réinitialisation de mot de passe n'existe pas.") {
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

// FIXME: used ?
class SessionWithIdAndInformationOnMassImportError extends DomainError {
  constructor(message = 'Merci de ne pas renseigner les informations de session') {
    super(message);
  }
}

class SessionNotAccessible extends DomainError {
  constructor(message = "La session de certification n'est plus accessible.") {
    super(message);
  }
}

class TargetProfileInvalidError extends DomainError {
  constructor(message = 'Le profil cible ne possède aucun acquis ciblé.') {
    super(message);
  }
}

class StageModificationForbiddenForLinkedTargetProfileError extends DomainError {
  constructor(targetProfileId) {
    super(
      `Le profil cible ${targetProfileId} est déjà rattaché à une campagne. La modification du seuil ou niveau est alors impossible.`,
    );
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
class UserNotAuthorizedToUpdateEmailError extends DomainError {
  constructor(message = 'User is not authorized to update email') {
    super(message);
  }
}

class UserHasAlreadyLeftSCO extends DomainError {
  constructor(message = 'User has already left SCO.') {
    super(message);
  }
}

class UserIsTemporaryBlocked extends DomainError {
  constructor(message = 'User has been temporary blocked.', code = 'USER_IS_TEMPORARY_BLOCKED') {
    super(message, code);
  }
}

class UserIsBlocked extends DomainError {
  constructor(message = 'User has been blocked.', code = 'USER_IS_BLOCKED') {
    super(message, code);
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
  constructor(
    message = "L'utilisateur n'est pas autorisé à mettre à jour ce mot de passe.",
    code = 'USER_NOT_AUTHORIZED_TO_UPDATE_PASSWORD',
  ) {
    super(message, code);
  }
}

class UserNotAuthorizedToRemoveAuthenticationMethod extends DomainError {
  constructor(message = "L'utilisateur n'est pas autorisé à supprimer cette méthode de connexion.") {
    super(message);
  }
}

class OrganizationLearnerDisabledError extends DomainError {
  constructor(message = "L'inscription de l'élève est désactivée dans l'organisation.") {
    super(message);
  }
}

class OrganizationLearnerNotFound extends NotFoundError {
  constructor(message = 'Aucune inscription d‘élève n‘a été trouvée.') {
    super(message);
  }
}

class UserCantBeCreatedError extends DomainError {
  constructor(message = "L'utilisateur ne peut pas être créé") {
    super(message);
  }
}

class UserNotFoundError extends NotFoundError {
  constructor(message = 'Ce compte est introuvable.', code = 'USER_ACCOUNT_NOT_FOUND') {
    super(message, code);
  }

  getErrorMessage() {
    return {
      data: {
        id: ['Ce compte est introuvable.'],
      },
    };
  }
}

class UnknownCountryForStudentEnrolmentError extends DomainError {
  constructor(
    { firstName, lastName },
    message = `L'élève ${firstName} ${lastName} a été inscrit avec un code pays de naissance invalide. Veuillez corriger ses informations sur l'espace PixOrga de l'établissement ou contacter le support Pix`,
  ) {
    super(message);
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

const SIECLE_ERRORS = {
  INE_REQUIRED: 'INE_REQUIRED',
  INE_UNIQUE: 'INE_UNIQUE',
  SEX_CODE_REQUIRED: 'SEX_CODE_REQUIRED',
  BIRTH_CITY_CODE_REQUIRED_FOR_FR_STUDENT: 'BIRTH_CITY_CODE_REQUIRED_FOR_FR_STUDENT',
  BIRTHDATE_REQUIRED: 'BIRTHDATE_REQUIRED',
  INVALID_BIRTHDATE_FORMAT: 'INVALID_BIRTHDATE_FORMAT',
};

class NotImplementedError extends Error {
  constructor(message = 'Not implemented error.') {
    super(message);
  }
}

class InvalidMembershipOrganizationRoleError extends DomainError {
  constructor(message = 'Le rôle du membre est invalide.') {
    super(message);
  }
}

class TooManyRows extends DomainError {
  constructor(message = 'Plusieurs enregistrements ont été retrouvés.') {
    super(message);
  }
}

class OidcMissingFieldsError extends DomainError {
  constructor(
    message = 'Mandatory information returned by the identify provider about the user is missing.',
    code,
    meta,
  ) {
    super(message);
    this.code = code;
    this.meta = meta;
  }
}

class InvalidIdentityProviderError extends DomainError {
  constructor(identityProvider) {
    const message = `Identity provider ${identityProvider} is not supported.`;
    super(message);
  }
}

class YamlParsingError extends DomainError {
  constructor(message = "Une erreur s'est produite lors de l'interprétation des réponses.") {
    super(message);
  }
}

class InvalidExternalAPIResponseError extends DomainError {
  constructor(message = "L'API externe a renvoyé une réponse incorrecte.") {
    super(message);
  }
}

class NoOrganizationToAttach extends DomainError {
  constructor(message) {
    super(message);
  }
}

class InvalidVerificationCodeError extends DomainError {
  constructor(
    message = 'Le code de vérification renseigné ne correspond pas à celui enregistré.',
    code = 'INVALID_VERIFICATION_CODE',
  ) {
    super(message, code);
  }
}

class EmailModificationDemandNotFoundOrExpiredError extends DomainError {
  constructor(
    message = "La demande de modification d'adresse e-mail n'existe pas ou est expirée.",
    code = 'EXPIRED_OR_NULL_EMAIL_MODIFICATION_DEMAND',
  ) {
    super(message, code);
  }
}

class InvalidSessionSupervisingLoginError extends DomainError {
  constructor(
    message = SESSION_SUPERVISING.INCORRECT_DATA.getMessage(),
    code = SESSION_SUPERVISING.INCORRECT_DATA.code,
  ) {
    super(message, code);
  }
}

class CandidateNotAuthorizedToJoinSessionError extends DomainError {
  constructor(
    message = 'Votre surveillant n’a pas confirmé votre présence dans la salle de test. Vous ne pouvez donc pas encore commencer votre test de certification. Merci de prévenir votre surveillant.',
    code = 'CANDIDATE_NOT_AUTHORIZED_TO_JOIN_SESSION',
  ) {
    super(message, code);
  }
}

class CandidateNotAuthorizedToResumeCertificationTestError extends DomainError {
  constructor(
    message = "Merci de contacter votre surveillant afin qu'il autorise la reprise de votre test.",
    code = 'CANDIDATE_NOT_AUTHORIZED_TO_RESUME_SESSION',
  ) {
    super(message, code);
  }
}

class OrganizationLearnerCannotBeDissociatedError extends DomainError {
  constructor(message = 'Impossible de dissocier') {
    super(message);
  }
}

class AcquiredBadgeForbiddenDeletionError extends DomainError {
  constructor(message = 'Il est interdit de supprimer un résultat thématique déjà acquis par un utilisateur.') {
    super(message);
  }
}

class CertificationBadgeForbiddenDeletionError extends DomainError {
  constructor(message = 'Il est interdit de supprimer un résultat thématique lié à une certification.') {
    super(message);
  }
}

class MissingBadgeCriterionError extends DomainError {
  constructor(message = 'Vous devez définir au moins un critère pour créer ce résultat thématique.') {
    super(message);
  }
}

class DifferentExternalIdentifierError extends DomainError {
  constructor(
    message = "La valeur de l'externalIdentifier de la méthode de connexion ne correspond pas à celui reçu par le partenaire.",
  ) {
    super(message);
  }
}

class NoSkillsInCampaignError extends DomainError {
  constructor(message = 'La campagne ne contient aucun acquis opérationnel.') {
    super(message);
  }
}

class InvalidJuryLevelError extends DomainError {
  constructor(message = 'Le niveau jury renseigné est invalide.') {
    super(message);
  }
}

class InvalidStageError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class AuditLoggerApiError extends DomainError {
  constructor(message) {
    super(message);
  }
}

class OrganizationLearnerCertificabilityNotUpdatedError extends DomainError {
  constructor(message) {
    super(message);
  }
}

export {
  AccountRecoveryDemandExpired,
  AccountRecoveryDemandNotCreatedError,
  AccountRecoveryUserAlreadyConfirmEmail,
  AcquiredBadgeForbiddenDeletionError,
  AlreadyAcceptedOrCancelledInvitationError,
  AlreadyExistingAdminMemberError,
  AlreadyExistingCampaignParticipationError,
  AlreadyExistingEntityError,
  AlreadyExistingInvitationError,
  AlreadyExistingMembershipError,
  AlreadyRatedAssessmentError,
  AlreadyRegisteredEmailAndUsernameError,
  AlreadyRegisteredEmailError,
  AlreadyRegisteredUsernameError,
  AlreadySharedCampaignParticipationError,
  AnswerEvaluationError,
  ApplicationScopeNotAllowedError,
  ApplicationWithInvalidClientIdError,
  ApplicationWithInvalidClientSecretError,
  AssessmentEndedError,
  AssessmentNotCompletedError,
  AuditLoggerApiError,
  AuthenticationKeyExpired,
  AuthenticationMethodAlreadyExistsError,
  AuthenticationMethodNotFoundError,
  CampaignCodeError,
  CampaignTypeError,
  CancelledInvitationError,
  CandidateNotAuthorizedToJoinSessionError,
  CandidateNotAuthorizedToResumeCertificationTestError,
  CantCalculateCampaignParticipationResultError,
  CantImproveCampaignParticipationError,
  CertificateVerificationCodeGenerationTooManyTrials,
  CertificationBadgeForbiddenDeletionError,
  CertificationCandidateAlreadyLinkedToUserError,
  CertificationCandidateByPersonalInfoNotFoundError,
  CertificationCandidateByPersonalInfoTooManyMatchesError,
  CertificationCandidateCreationOrUpdateError,
  CertificationCandidateDeletionError,
  CertificationCandidateMultipleUserLinksWithinSessionError,
  CertificationCandidateNotFoundError,
  CertificationCandidateOnFinalizedSessionError,
  CertificationCandidatePersonalInfoFieldMissingError,
  CertificationCandidatePersonalInfoWrongFormat,
  CertificationCandidatesError,
  CertificationCenterMembershipCreationError,
  CertificationCenterMembershipDisableError,
  CertificationComputeError,
  CertificationCourseNotPublishableError,
  CertificationEndedByFinalizationError,
  CertificationEndedBySupervisorError,
  CertificationIssueReportAutomaticallyResolvedShouldNotBeUpdatedManually,
  ChallengeAlreadyAnsweredError,
  ChallengeNotAskedError,
  ChallengeToBeDeneutralizedNotFoundError,
  ChallengeToBeNeutralizedNotFoundError,
  CompetenceResetError,
  CsvParsingError,
  DeletedError,
  DeprecatedCertificationIssueReportCategoryError,
  DeprecatedCertificationIssueReportSubcategoryError,
  DifferentExternalIdentifierError,
  DomainError,
  EmailModificationDemandNotFoundOrExpiredError,
  FileValidationError,
  ImproveCompetenceEvaluationForbiddenError,
  InvalidCertificationCandidate,
  InvalidCertificationIssueReportForSaving,
  InvalidExternalAPIResponseError,
  InvalidIdentityProviderError,
  InvalidJuryLevelError,
  InvalidMembershipOrganizationRoleError,
  InvalidPasswordForUpdateEmailError,
  InvalidSessionSupervisingLoginError,
  InvalidStageError,
  InvalidVerificationCodeError,
  ManyOrganizationsFoundError,
  MatchingReconciledStudentNotFoundError,
  MembershipCreationError,
  MembershipUpdateError,
  MissingAttributesError,
  MissingBadgeCriterionError,
  MissingUserAccountError,
  MultipleOrganizationLearnersWithDifferentNationalStudentIdError,
  NoCampaignParticipationForUserAndCampaign,
  NoOrganizationToAttach,
  NoSkillsInCampaignError,
  NoStagesForCampaign,
  NotEligibleCandidateError,
  NotEnoughDaysPassedBeforeResetCampaignParticipationError,
  NotFoundError,
  NotImplementedError,
  ObjectValidationError,
  OidcMissingFieldsError,
  OrganizationAlreadyExistError,
  OrganizationArchivedError,
  OrganizationLearnerAlreadyLinkedToInvalidUserError,
  OrganizationLearnerAlreadyLinkedToUserError,
  OrganizationLearnerCannotBeDissociatedError,
  OrganizationLearnerCertificabilityNotUpdatedError,
  OrganizationLearnerDisabledError,
  OrganizationLearnerNotFound,
  OrganizationLearnersConstraintError,
  OrganizationLearnersCouldNotBeSavedError,
  OrganizationNotAuthorizedMultipleSendingAssessmentToCreateCampaignError,
  OrganizationNotFoundError,
  OrganizationTagNotFound,
  OrganizationWithoutEmailError,
  PasswordResetDemandNotFoundError,
  SendingEmailError,
  SendingEmailToInvalidDomainError,
  SendingEmailToInvalidEmailAddressError,
  SendingEmailToRefererError,
  SendingEmailToResultRecipientError,
  SessionNotAccessible,
  SessionWithIdAndInformationOnMassImportError,
  SIECLE_ERRORS,
  StageModificationForbiddenForLinkedTargetProfileError,
  SupervisorAccessNotAuthorizedError,
  TargetProfileCannotBeCreated,
  TargetProfileInvalidError,
  TooManyRows,
  UncancellableCertificationCenterInvitationError,
  UncancellableOrganizationInvitationError,
  UnexpectedUserAccountError,
  UnknownCountryForStudentEnrolmentError,
  UserAlreadyExistsWithAuthenticationMethodError,
  UserAlreadyLinkedToCandidateInSessionError,
  UserCantBeCreatedError,
  UserCouldNotBeReconciledError,
  UserHasAlreadyLeftSCO,
  UserIsBlocked,
  UserIsTemporaryBlocked,
  UserNotAuthorizedToAccessEntityError,
  UserNotAuthorizedToCertifyError,
  UserNotAuthorizedToCreateCampaignError,
  UserNotAuthorizedToCreateResourceError,
  UserNotAuthorizedToGenerateUsernamePasswordError,
  UserNotAuthorizedToGetCampaignResultsError,
  UserNotAuthorizedToRemoveAuthenticationMethod,
  UserNotAuthorizedToUpdateCampaignError,
  UserNotAuthorizedToUpdateEmailError,
  UserNotAuthorizedToUpdatePasswordError,
  UserNotAuthorizedToUpdateResourceError,
  UserNotFoundError,
  UserNotMemberOfOrganizationError,
  UserOrgaSettingsCreationError,
  UserShouldNotBeReconciledOnAnotherAccountError,
  WrongDateFormatError,
  YamlParsingError,
};
