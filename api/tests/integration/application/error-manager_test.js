import { expect, HttpTestServer, sinon } from '../../test-helper.js';
import * as DomainErrors from '../../../lib/domain/errors.js';
import {
  CsvImportError,
  EntityValidationError,
  ForbiddenAccess,
  InvalidResultRecipientTokenError,
  InvalidTemporaryKeyError,
} from '../../../src/shared/domain/errors.js';
import {
  MissingOrInvalidCredentialsError,
  UserShouldChangePasswordError,
} from '../../../src/authentication/domain/errors.js';
import { InvalidCertificationReportForFinalization } from '../../../src/certification/shared/domain/errors.js';

describe('Integration | API | Controller Error', function () {
  let server;
  // TODO: Fix this the next time the file is edited.
  // eslint-disable-next-line mocha/no-setup-in-describe
  const routeHandler = sinon.stub();

  const routeUrl = '/test_route';
  const request = { method: 'GET', url: routeUrl };

  function responseDetail(response) {
    const payload = JSON.parse(response.payload);
    return payload.errors[0].detail;
  }

  function responseCode(response) {
    const payload = JSON.parse(response.payload);
    return payload.errors[0].code;
  }

  function responseTitle(response) {
    const payload = JSON.parse(response.payload);
    return payload.errors[0].title;
  }

  before(async function () {
    const moduleUnderTest = {
      name: 'test-route',
      register: async function (server) {
        server.route([
          {
            method: 'GET',
            path: routeUrl,
            handler: routeHandler,
            config: {
              auth: false,
            },
          },
        ]);
      },
    };
    server = new HttpTestServer({ mustThrowOn5XXError: false });
    await server.register(moduleUnderTest);
  });

  context('412 Precondition Failed', function () {
    const PRECONDITION_FAILED = 412;

    it('responds Precondition Failed when a AlreadyExistingEntityError occurs', async function () {
      routeHandler.throws(new DomainErrors.AlreadyExistingEntityError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
      expect(responseDetail(response)).to.equal('L’entité existe déjà.');
    });

    it('responds Precondition Failed when a AlreadyRatedAssessmentError error occurs', async function () {
      routeHandler.throws(new DomainErrors.AlreadyRatedAssessmentError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
      expect(responseDetail(response)).to.equal('Assessment is already rated.');
    });

    it('responds Precondition Failed when a CompetenceResetError error occurs', async function () {
      routeHandler.throws(new DomainErrors.CompetenceResetError(2));
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
      expect(responseDetail(response)).to.equal('Il reste 2 jours avant de pouvoir réinitiliser la compétence.');
    });

    it('responds Precondition Failed when a AlreadyExistingMembershipError error occurs', async function () {
      routeHandler.throws(new DomainErrors.AlreadyExistingMembershipError('Le membership existe déjà.'));
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
      expect(responseDetail(response)).to.equal('Le membership existe déjà.');
    });

    it('responds Precondition Failed when a AlreadyExistingInvitationError error occurs', async function () {
      routeHandler.throws(
        new DomainErrors.AlreadyExistingInvitationError("L'invitation de l'organisation existe déjà."),
      );
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
      expect(responseDetail(response)).to.equal("L'invitation de l'organisation existe déjà.");
    });

    it('responds Precondition Failed when a AlreadySharedCampaignParticipationError error occurs', async function () {
      routeHandler.throws(
        new DomainErrors.AlreadySharedCampaignParticipationError('Ces résultats de campagne ont déjà été partagés.'),
      );
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
      expect(responseDetail(response)).to.equal('Ces résultats de campagne ont déjà été partagés.');
    });

    it('responds Precondition Failed when a AlreadyExistingCampaignParticipationError error occurs', async function () {
      routeHandler.throws(new DomainErrors.AlreadyExistingCampaignParticipationError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
    });

    it('responds Precondition Failed when a CsvImportError error occurs', async function () {
      routeHandler.throws(new CsvImportError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
    });

    it('responds Precondition Failed when a SiecleXmlImportError error occurs', async function () {
      routeHandler.throws(new DomainErrors.SiecleXmlImportError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
    });

    it('responds Precondition Failed when a TargetProfileInvalidError error occurs', async function () {
      routeHandler.throws(new DomainErrors.TargetProfileInvalidError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
    });

    it('responds Precondition Failed when a NoStagesForCampaign error occurs', async function () {
      routeHandler.throws(new DomainErrors.NoStagesForCampaign());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
    });

    it('responds Precondition Failed when a SessionNotAccessible error occurs', async function () {
      routeHandler.throws(new DomainErrors.SessionNotAccessible());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
    });

    it('responds Precondition Failed when a NoCampaignParticipationForUserAndCampaign error occurs', async function () {
      routeHandler.throws(new DomainErrors.NoCampaignParticipationForUserAndCampaign());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
    });

    it('responds Precondition Failed when a OrganizationLearnerDisabledError occurs', async function () {
      routeHandler.throws(new DomainErrors.OrganizationLearnerDisabledError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
    });

    it('responds Precondition Failed when a NoOrganizationToAttach occurs', async function () {
      routeHandler.throws(new DomainErrors.NoOrganizationToAttach());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
    });

    it('responds Precondition Failed when a OrganizationLearnerCannotBeDissociated occurs', async function () {
      routeHandler.throws(new DomainErrors.OrganizationLearnerCannotBeDissociatedError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
    });

    it('responds Precondition Failed when a CampaignParticipationDeletedError occurs', async function () {
      routeHandler.throws(new DomainErrors.CampaignParticipationDeletedError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(PRECONDITION_FAILED);
    });
  });

  context('404 Not Found', function () {
    const NOT_FOUND_ERROR = 404;

    it('responds Not Found when a DomainError.NotFoundError error occurs', async function () {
      routeHandler.throws(new DomainErrors.NotFoundError('Entity Not Found'));
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(NOT_FOUND_ERROR);
      expect(responseDetail(response)).to.equal('Entity Not Found');
    });

    it('responds Not Found when a CampaignCodeError error occurs', async function () {
      routeHandler.throws(new DomainErrors.CampaignCodeError('Campaign Code Error'));
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(NOT_FOUND_ERROR);
      expect(responseDetail(response)).to.equal('Campaign Code Error');
    });

    it('responds Not Found when a CertificationCandidateByPersonalInfoNotFoundError error occurs', async function () {
      routeHandler.throws(new DomainErrors.CertificationCandidateByPersonalInfoNotFoundError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(NOT_FOUND_ERROR);
      expect(responseDetail(response)).to.equal(
        "Aucun candidat de certification ne correspond aux informations d'identité fournies.",
      );
    });

    it('responds Not Found when a UserNotFoundError error occurs', async function () {
      routeHandler.throws(new DomainErrors.UserNotFoundError('Ce compte est introuvable.'));
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(NOT_FOUND_ERROR);
      expect(responseDetail(response)).to.equal('Ce compte est introuvable.');
    });

    it('responds Not Found when a PasswordResetDemandNotFoundError error occurs', async function () {
      routeHandler.throws(
        new DomainErrors.PasswordResetDemandNotFoundError(
          "La demande de réinitialisation de mot de passe n'existe pas.",
        ),
      );
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(NOT_FOUND_ERROR);
      expect(responseDetail(response)).to.equal("La demande de réinitialisation de mot de passe n'existe pas.");
    });

    it('responds Not Found when a NoCertificationResultForDivision error occurs', async function () {
      routeHandler.throws(new DomainErrors.NoCertificationResultForDivision());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(NOT_FOUND_ERROR);
      expect(responseDetail(response)).to.equal('Aucun résultat de certification pour cette classe.');
    });

    it('responds Not Found when a ChallengeToBeNeutralizedNotFoundError error occurs', async function () {
      routeHandler.throws(new DomainErrors.ChallengeToBeNeutralizedNotFoundError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(NOT_FOUND_ERROR);
      expect(responseDetail(response)).to.equal(
        "La question à neutraliser n'a pas été posée lors du test de certification",
      );
    });

    it('responds Not Found when a ChallengeToBeDeneutralizedNotFoundError error occurs', async function () {
      routeHandler.throws(new DomainErrors.ChallengeToBeDeneutralizedNotFoundError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(NOT_FOUND_ERROR);
      expect(responseDetail(response)).to.equal(
        "La question à dé-neutraliser n'a pas été posée lors du test de certification",
      );
    });
  });

  context('409 Conflict', function () {
    const CONFLICT_ERROR = 409;

    it('responds Conflict when a CertificationCandidateByPersonalInfoTooManyMatchesError error occurs', async function () {
      routeHandler.throws(new DomainErrors.CertificationCandidateByPersonalInfoTooManyMatchesError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(CONFLICT_ERROR);
      expect(responseDetail(response)).to.equal(
        "Plus d'un candidat de certification correspondent aux informations d'identité fournies.",
      );
    });

    it('responds Conflict when a ChallengeAlreadyAnsweredError error occurs', async function () {
      routeHandler.throws(new DomainErrors.ChallengeAlreadyAnsweredError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(CONFLICT_ERROR);
      expect(responseDetail(response)).to.equal('This challenge has already been answered.');
    });

    it('responds Conflict when a AssessmentNotCompletedError error occurs', async function () {
      routeHandler.throws(new DomainErrors.AssessmentNotCompletedError("Cette évaluation n'est pas terminée."));
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(CONFLICT_ERROR);
      expect(responseDetail(response)).to.equal("Cette évaluation n'est pas terminée.");
    });

    it('responds Conflict when a OrganizationLearnerAlreadyLinkedToUserError error occurs', async function () {
      routeHandler.throws(
        new DomainErrors.OrganizationLearnerAlreadyLinkedToUserError(
          "L'élève est déjà rattaché à un compte utilisateur.",
        ),
      );
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(CONFLICT_ERROR);
      expect(responseDetail(response)).to.equal("L'élève est déjà rattaché à un compte utilisateur.");
    });

    it('responds Conflict when a AccountRecoveryUserAlreadyConfirmEmail error occurs', async function () {
      routeHandler.throws(new DomainErrors.AccountRecoveryUserAlreadyConfirmEmail());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(CONFLICT_ERROR);
      expect(responseDetail(response)).to.equal('This user has already a confirmed email.');
    });

    it('responds Conflict when an AlreadyAcceptedOrCancelledInvitationError occurs', async function () {
      routeHandler.throws(new DomainErrors.AlreadyAcceptedOrCancelledInvitationError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(CONFLICT_ERROR);
      expect(responseDetail(response)).to.equal("L'invitation a déjà été acceptée ou annulée.");
    });
  });

  context('403 Forbidden', function () {
    const FORBIDDEN_ERROR = 403;

    it('responds Forbidden when a UserNotAuthorizedToAccessEntityError error occurs', async function () {
      routeHandler.throws(new DomainErrors.UserNotAuthorizedToAccessEntityError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(FORBIDDEN_ERROR);
      expect(responseDetail(response)).to.equal('Utilisateur non autorisé à accéder à la ressource');
    });

    it('responds Forbidden when a UserNotAuthorizedToUpdateResourceError error occurs', async function () {
      routeHandler.throws(
        new DomainErrors.UserNotAuthorizedToUpdateResourceError(
          'Utilisateur non autorisé à mettre à jour à la ressource',
        ),
      );
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(FORBIDDEN_ERROR);
      expect(responseDetail(response)).to.equal('Utilisateur non autorisé à mettre à jour à la ressource');
    });

    it('responds Forbidden when a UserNotAuthorizedToCreateCampaignError error occurs', async function () {
      routeHandler.throws(
        new DomainErrors.UserNotAuthorizedToCreateCampaignError('Utilisateur non autorisé à créer une campagne'),
      );
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(FORBIDDEN_ERROR);
      expect(responseDetail(response)).to.equal('Utilisateur non autorisé à créer une campagne');
    });

    it('responds Forbidden when a CertificationCandidateAlreadyLinkedToUserError error occurs', async function () {
      routeHandler.throws(new DomainErrors.CertificationCandidateAlreadyLinkedToUserError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(FORBIDDEN_ERROR);
      expect(responseCode(response)).to.equal('SESSION_STARTED_CANDIDATE_ALREADY_LINKED_TO_USER');
    });

    it('responds Forbidden when a CertificationCandidateForbiddenDeletionError error occurs', async function () {
      routeHandler.throws(new DomainErrors.CertificationCandidateForbiddenDeletionError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(FORBIDDEN_ERROR);
      expect(responseDetail(response)).to.equal(
        'Il est interdit de supprimer un candidat de certification déjà lié à un utilisateur.',
      );
    });

    it('responds Forbidden when a ForbiddenAccess error occurs', async function () {
      routeHandler.throws(new ForbiddenAccess('Accès non autorisé.'));
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(FORBIDDEN_ERROR);
      expect(responseDetail(response)).to.equal('Accès non autorisé.');
    });

    it('responds Forbidden when a UserAlreadyLinkedToCandidateInSessionError error occurs', async function () {
      routeHandler.throws(new DomainErrors.UserAlreadyLinkedToCandidateInSessionError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(FORBIDDEN_ERROR);
      expect(responseDetail(response)).to.equal("L'utilisateur est déjà lié à un candidat dans cette session.");
    });

    it('responds Forbidden when a UserNotAuthorizedToCertifyError error occurs', async function () {
      routeHandler.throws(new DomainErrors.UserNotAuthorizedToCertifyError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(FORBIDDEN_ERROR);
      expect(responseDetail(response)).to.equal('The user cannot be certified.');
    });

    it('responds Forbidden when a UserNotAuthorizedToGetCampaignResultsError error occurs', async function () {
      routeHandler.throws(
        new DomainErrors.UserNotAuthorizedToGetCampaignResultsError(
          "Cet utilisateur n'est pas autorisé à récupérer les résultats de la campagne.",
        ),
      );
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(FORBIDDEN_ERROR);
      expect(responseDetail(response)).to.equal(
        "Cet utilisateur n'est pas autorisé à récupérer les résultats de la campagne.",
      );
    });

    it('responds Forbidden when a UserNotAuthorizedToUpdatePasswordError error occurs', async function () {
      routeHandler.throws(
        new DomainErrors.UserNotAuthorizedToUpdatePasswordError(
          "Cet utilisateur n'est pas autorisé à récupérer les résultats de la campagne.",
        ),
      );
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(FORBIDDEN_ERROR);
      expect(responseDetail(response)).to.equal(
        "Cet utilisateur n'est pas autorisé à récupérer les résultats de la campagne.",
      );
    });

    it('responds Forbidden when a UserNotAuthorizedToCreateResourceError error occurs', async function () {
      routeHandler.throws(
        new DomainErrors.UserNotAuthorizedToCreateResourceError(
          "Cet utilisateur n'est pas autorisé à créer la ressource.",
        ),
      );
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(FORBIDDEN_ERROR);
      expect(responseDetail(response)).to.equal("Cet utilisateur n'est pas autorisé à créer la ressource.");
    });

    it('responds Forbidden when a ImproveCompetenceEvaluationForbiddenError error occurs', async function () {
      routeHandler.throws(new DomainErrors.ImproveCompetenceEvaluationForbiddenError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(FORBIDDEN_ERROR);
      expect(responseDetail(response)).to.equal('Le niveau maximum est déjà atteint pour cette compétence.');
      expect(responseTitle(response)).to.equal('ImproveCompetenceEvaluationForbidden');
    });

    it('responds Forbidden when a ApplicationScopeNotAllowedError error occurs', async function () {
      routeHandler.throws(new DomainErrors.ApplicationScopeNotAllowedError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(FORBIDDEN_ERROR);
      expect(responseDetail(response)).to.equal('The scope is not allowed.');
      expect(responseTitle(response)).to.equal('Forbidden');
    });

    it('responds Forbidden when a CancelledInvitationError error occurs', async function () {
      routeHandler.throws(new DomainErrors.CancelledInvitationError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(FORBIDDEN_ERROR);
      expect(responseDetail(response)).to.equal("L'invitation à cette organisation a été annulée.");
      expect(responseTitle(response)).to.equal('Forbidden');
    });
  });

  context('400 Bad Request', function () {
    const BAD_REQUEST_ERROR = 400;

    it('responds Bad Request when a CertificationCandidatePersonalInfoFieldMissingError error occurs', async function () {
      routeHandler.throws(new DomainErrors.CertificationCandidatePersonalInfoFieldMissingError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(BAD_REQUEST_ERROR);
      expect(responseDetail(response)).to.equal("Un ou plusieurs champs d'informations d'identité sont manquants.");
    });

    it('responds Bad Request when a CertificationCandidatePersonalInfoWrongFormat error occurs', async function () {
      routeHandler.throws(new DomainErrors.CertificationCandidatePersonalInfoWrongFormat());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(BAD_REQUEST_ERROR);
      expect(responseDetail(response)).to.equal(
        "Un ou plusieurs champs d'informations d'identité sont au mauvais format.",
      );
    });

    it('responds Bad Request when a CertificationCenterMembershipCreationError error occurs', async function () {
      routeHandler.throws(new DomainErrors.CertificationCenterMembershipCreationError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(BAD_REQUEST_ERROR);
      expect(responseDetail(response)).to.equal("Le membre ou le centre de certification n'existe pas.");
    });

    it('responds Bad Request when a InvalidCertificationReportForFinalization error occurs', async function () {
      routeHandler.throws(
        new InvalidCertificationReportForFinalization('Echec lors de la validation du certification course'),
      );
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(BAD_REQUEST_ERROR);
      expect(responseDetail(response)).to.equal('Echec lors de la validation du certification course');
    });

    it('responds Bad Request when a MembershipCreationError error occurs', async function () {
      routeHandler.throws(
        new DomainErrors.MembershipCreationError('Erreur lors de la création du membership à une organisation.'),
      );
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(BAD_REQUEST_ERROR);
      expect(responseDetail(response)).to.equal('Erreur lors de la création du membership à une organisation.');
    });

    it('responds Bad Request when a MembershipUpdateError error occurs', async function () {
      routeHandler.throws(
        new DomainErrors.MembershipUpdateError('Erreur lors de la mise à jour du membership à une organisation.'),
      );
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(BAD_REQUEST_ERROR);
      expect(responseDetail(response)).to.equal('Erreur lors de la mise à jour du membership à une organisation.');
    });

    it('responds Bad Request when a OrganizationLearnersCouldNotBeSavedError error occurs', async function () {
      routeHandler.throws(new DomainErrors.OrganizationLearnersCouldNotBeSavedError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(BAD_REQUEST_ERROR);
      expect(responseDetail(response)).to.equal('An error occurred during process');
    });

    it('responds Bad Request when a WrongDateFormatError error occurs', async function () {
      routeHandler.throws(new DomainErrors.WrongDateFormatError('Format de date invalide.'));
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(BAD_REQUEST_ERROR);
      expect(responseDetail(response)).to.equal('Format de date invalide.');
    });

    it('responds Bad Request when a SessionAlreadyPublishedError error occurs', async function () {
      routeHandler.throws(new DomainErrors.SessionAlreadyPublishedError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(BAD_REQUEST_ERROR);
      expect(responseDetail(response)).to.equal('La session est déjà publiée.');
    });

    it('responds Bad Request when a UserOrgaSettingsCreationError error occurs', async function () {
      routeHandler.throws(
        new DomainErrors.UserOrgaSettingsCreationError(
          'Erreur lors de la création des paramètres utilisateur relatifs à Pix Orga.',
        ),
      );
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(BAD_REQUEST_ERROR);
      expect(responseDetail(response)).to.equal(
        'Erreur lors de la création des paramètres utilisateur relatifs à Pix Orga.',
      );
    });

    it('responds Bad Request when a SessionWithIdAndInformationOnMassImportError error occurs', async function () {
      routeHandler.throws(new DomainErrors.SessionWithIdAndInformationOnMassImportError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(BAD_REQUEST_ERROR);
      expect(responseDetail(response)).to.equal('Merci de ne pas renseigner les informations de session');
    });
  });

  context('422 Unprocessable Entity', function () {
    const UNPROCESSABLE_ENTITY_ERROR = 422;

    it('responds Unprocessable Entity when a ObjectValidationError error occurs', async function () {
      routeHandler.throws(new DomainErrors.ObjectValidationError('Erreur, objet non valide.'));
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(UNPROCESSABLE_ENTITY_ERROR);
      expect(responseDetail(response)).to.equal('Erreur, objet non valide.');
    });

    it('responds Unprocessable Entity when a FileValidationError error occurs', async function () {
      routeHandler.throws(new DomainErrors.FileValidationError('Erreur, fichier non valide.'));
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(UNPROCESSABLE_ENTITY_ERROR);
      expect(responseDetail(response)).to.equal('An error occurred, file is invalid');
    });

    it('responds Unprocessable Entity when a UserNotMemberOfOrganizationError error occurs', async function () {
      routeHandler.throws(
        new DomainErrors.UserNotMemberOfOrganizationError("L'utilisateur n'est pas membre de l'organisation."),
      );
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(UNPROCESSABLE_ENTITY_ERROR);
      expect(responseDetail(response)).to.equal("L'utilisateur n'est pas membre de l'organisation.");
    });

    it('responds Unprocessable Entity with invalid data attribute', async function () {
      // given
      const invalidAttributes = [
        {
          attribute: 'firstname',
          message: 'Le prénom n’est pas renseigné.',
        },
      ];
      routeHandler.throws(new EntityValidationError({ invalidAttributes }));

      // when
      const response = await server.requestObject(request);

      // then
      expect(response.statusCode).to.equal(UNPROCESSABLE_ENTITY_ERROR);

      const payload = JSON.parse(response.payload);
      expect(payload.errors).to.have.lengthOf(1);

      const unprocessableErrorOnFirstname = payload.errors[0];
      expect(unprocessableErrorOnFirstname.status).to.equal('422');
      expect(unprocessableErrorOnFirstname.source.pointer).to.equal('/data/attributes/firstname');
      expect(unprocessableErrorOnFirstname.title).to.equal('Invalid data attribute "firstname"');
      expect(unprocessableErrorOnFirstname.detail).to.equal('Le prénom n’est pas renseigné.');
    });

    it('responds Unprocessable Entity with invalid relationships if name ends with Id', async function () {
      // given
      const invalidAttributes = [
        {
          attribute: 'targetProfileId',
          message: 'Le profile cible n’est pas renseigné.',
        },
      ];
      routeHandler.throws(new EntityValidationError({ invalidAttributes }));

      // when
      const response = await server.requestObject(request);

      // then
      expect(response.statusCode).to.equal(UNPROCESSABLE_ENTITY_ERROR);

      const payload = JSON.parse(response.payload);
      expect(payload.errors).to.have.lengthOf(1);

      const unprocessableErrorOnFirstname = payload.errors[0];
      expect(unprocessableErrorOnFirstname.status).to.equal('422');
      expect(unprocessableErrorOnFirstname.source.pointer).to.equal('/data/relationships/target-profile');
      expect(unprocessableErrorOnFirstname.title).to.equal('Invalid relationship "targetProfile"');
      expect(unprocessableErrorOnFirstname.detail).to.equal('Le profile cible n’est pas renseigné.');
    });

    it('responds Unprocessable Entity with invalid data attribute with name ends with Id', async function () {
      // given
      const invalidAttributes = [
        {
          attribute: 'participantExternalId',
          message: 'Un identifiant externe est requis pour accèder à la campagne.',
        },
      ];
      routeHandler.throws(new EntityValidationError({ invalidAttributes }));

      // when
      const response = await server.requestObject(request);

      // then
      expect(response.statusCode).to.equal(UNPROCESSABLE_ENTITY_ERROR);

      const payload = JSON.parse(response.payload);
      expect(payload.errors).to.have.lengthOf(1);

      const unprocessableErrorOnFirstname = payload.errors[0];
      expect(unprocessableErrorOnFirstname.status).to.equal('422');
      expect(unprocessableErrorOnFirstname.source.pointer).to.equal('/data/attributes/participant-external-id');
      expect(unprocessableErrorOnFirstname.title).to.equal('Invalid data attribute "participantExternalId"');
      expect(unprocessableErrorOnFirstname.detail).to.equal(
        'Un identifiant externe est requis pour accèder à la campagne.',
      );
    });

    it('responds Unprocessable Entity with invalid data attribute, if attribute is undefined', async function () {
      // given
      const invalidAttributes = [
        {
          attribute: undefined,
          message: 'Vous devez renseigner une adresse e-mail et/ou un identifiant.',
        },
      ];
      routeHandler.throws(new EntityValidationError({ invalidAttributes }));

      // when
      const response = await server.requestObject(request);

      // then
      expect(response.statusCode).to.equal(UNPROCESSABLE_ENTITY_ERROR);

      const payload = JSON.parse(response.payload);
      expect(payload.errors).to.have.lengthOf(1);

      const unprocessableErrorOnFirstname = payload.errors[0];
      expect(unprocessableErrorOnFirstname.status).to.equal('422');
      expect(unprocessableErrorOnFirstname.source).to.be.undefined;
      expect(unprocessableErrorOnFirstname.title).to.equal('Invalid data attributes');
      expect(unprocessableErrorOnFirstname.detail).to.equal(
        'Vous devez renseigner une adresse e-mail et/ou un identifiant.',
      );
    });

    it('should create a new JSONAPI unprocessable with multiple invalid attributes', async function () {
      // given
      const invalidAttributes = [
        {
          attribute: 'firstname',
          message: 'Le prénom n’est pas renseigné.',
        },
        {
          attribute: 'lastname',
          message: 'Le nom n’est pas renseigné.',
        },
        {
          attribute: 'targetProfileId',
          message: 'Le profile cible n’est pas renseigné.',
        },
      ];
      routeHandler.throws(new EntityValidationError({ invalidAttributes }));

      // when
      const response = await server.requestObject(request);

      // then
      expect(response.statusCode).to.equal(UNPROCESSABLE_ENTITY_ERROR);

      const payload = JSON.parse(response.payload);
      expect(payload.errors).to.have.lengthOf(3);
    });

    it('responds UnprocessableEntity when a CertificationCandidatesError occurs', async function () {
      routeHandler.throws(new DomainErrors.CertificationCandidatesError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(UNPROCESSABLE_ENTITY_ERROR);
    });

    it('responds UnprocessableEntity when a UnknownCountryForStudentEnrolmentError occurs', async function () {
      routeHandler.throws(
        new DomainErrors.UnknownCountryForStudentEnrolmentError({ firstName: 'Paul', lastName: 'Preboist' }),
      );
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(UNPROCESSABLE_ENTITY_ERROR);
      expect(responseDetail(response)).to.equal(
        "L'élève Paul Preboist a été inscrit avec un code pays de naissance invalide. Veuillez corriger ses informations sur l'espace PixOrga de l'établissement ou contacter le support Pix",
      );
    });

    it('responds UnprocessableEntity when a AuthenticationMethodAlreadyExistsError occurs', async function () {
      routeHandler.throws(new DomainErrors.AuthenticationMethodAlreadyExistsError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(UNPROCESSABLE_ENTITY_ERROR);
      expect(responseDetail(response)).to.equal('Authentication method already exists.');
    });

    it('responds UnprocessableEntityError when an OrganizationArchived error occurs', async function () {
      routeHandler.throws(new DomainErrors.OrganizationArchivedError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(UNPROCESSABLE_ENTITY_ERROR);
      expect(responseDetail(response)).to.equal("L'organisation est archivée.");
    });

    it('responds UnprocessableEntityError when an MissingAttributes error occurs', async function () {
      routeHandler.throws(new DomainErrors.MissingAttributesError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(UNPROCESSABLE_ENTITY_ERROR);
      expect(responseDetail(response)).to.equal('Attributs manquants.');
    });
  });

  context('should respond 401 Unauthorized', function () {
    const UNAUTHORIZED_ERROR = 401;

    it('responds Unauthorized when a MissingOrInvalidCredentialsError error occurs', async function () {
      routeHandler.throws(new MissingOrInvalidCredentialsError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(UNAUTHORIZED_ERROR);
      expect(responseDetail(response)).to.equal("L'adresse e-mail et/ou le mot de passe saisis sont incorrects.");
    });

    it('responds Unauthorized when a InvalidTemporaryKeyError error occurs', async function () {
      routeHandler.throws(new InvalidTemporaryKeyError('Demande de réinitialisation invalide.'));
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(UNAUTHORIZED_ERROR);
      expect(responseDetail(response)).to.equal('Demande de réinitialisation invalide.');
    });

    it('responds Unauthorized when a InvalidResultRecipientTokenError error occurs', async function () {
      routeHandler.throws(new InvalidResultRecipientTokenError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(UNAUTHORIZED_ERROR);
      expect(responseDetail(response)).to.equal(
        'Le token de récupération des résultats de la session de certification est invalide.',
      );
    });

    it('responds Unauthorized when a UserShouldChangePasswordError error occurs', async function () {
      routeHandler.throws(new UserShouldChangePasswordError('Erreur, vous devez changer votre mot de passe.'));
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(UNAUTHORIZED_ERROR);
      expect(responseDetail(response)).to.equal('Erreur, vous devez changer votre mot de passe.');
    });

    it('responds Unauthorized when a UserCantBeCreatedError error occurs', async function () {
      routeHandler.throws(new DomainErrors.UserCantBeCreatedError("L'utilisateur ne peut pas être créé"));
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(UNAUTHORIZED_ERROR);
      expect(responseDetail(response)).to.equal("L'utilisateur ne peut pas être créé");
    });

    it('responds Unauthorized when a ApplicationWithInvalidClientSecretError error occurs', async function () {
      routeHandler.throws(new DomainErrors.ApplicationWithInvalidClientSecretError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(UNAUTHORIZED_ERROR);
      expect(responseDetail(response)).to.equal('The client secret is invalid.');
    });

    it('responds Unauthorized when a ApplicationWithInvalidClientIdError error occurs', async function () {
      routeHandler.throws(new DomainErrors.ApplicationWithInvalidClientIdError());
      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(UNAUTHORIZED_ERROR);
      expect(responseDetail(response)).to.equal('The client ID is invalid.');
    });
  });

  context('500 Internal Server Error', function () {
    const INTERNAL_SERVER_ERROR = 500;

    it('responds Internal Server Error error when another error occurs', async function () {
      // given
      routeHandler.throws(new Error('Unexpected Error'));

      // when
      const response = await server.requestObject(request);

      // then
      const payload = JSON.parse(response.payload);
      expect(response.statusCode).to.equal(INTERNAL_SERVER_ERROR);
      expect(payload.message).to.equal('An internal server error occurred');
    });
  });

  context('503 Service Unavailable Error', function () {
    const SERVICE_UNAVAILABLE_ERROR = 503;

    it('responds ServiceUnavailable when a SendingEmailError error occurs', async function () {
      routeHandler.throws(new DomainErrors.SendingEmailError(['toto@pix.fr', 'titi@pix.fr']));

      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(SERVICE_UNAVAILABLE_ERROR);
      expect(responseDetail(response)).to.equal("Échec lors de l'envoi de l'email.");
    });

    it('responds ServiceUnavailable when a SendingEmailToResultRecipientError error occurs', async function () {
      routeHandler.throws(new DomainErrors.SendingEmailToResultRecipientError(['toto@pix.fr', 'titi@pix.fr']));

      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(SERVICE_UNAVAILABLE_ERROR);
      expect(responseDetail(response)).to.equal(
        "Échec lors de l'envoi des résultats au(x) destinataire(s) : toto@pix.fr, titi@pix.fr",
      );
    });

    it('responds ServiceUnavailable when a SendingEmailToRefererError error occurs', async function () {
      routeHandler.throws(new DomainErrors.SendingEmailToRefererError(['toto@pix.fr', 'titi@pix.fr']));

      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(SERVICE_UNAVAILABLE_ERROR);
      expect(responseDetail(response)).to.equal(
        "Échec lors de l'envoi du mail au(x) référent(s) du centre de certification : toto@pix.fr, titi@pix.fr",
      );
    });

    it('responds NotFoundError when a CertificationCandidateNotFoundError error occurs', async function () {
      routeHandler.throws(new DomainErrors.CertificationCandidateNotFoundError());

      const response = await server.requestObject(request);

      expect(response.statusCode).to.equal(404);
      expect(responseDetail(response)).to.equal('No candidate found');
      expect(responseCode(response)).to.equal('CANDIDATE_NOT_FOUND');
    });
  });
});
