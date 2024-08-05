import { AdminMemberError } from '../../../src/authorization/domain/errors.js';
import { UnableToAttachChildOrganizationToParentOrganizationError } from '../../../src/organizational-entities/domain/errors.js';
import * as errors from '../../../src/shared/domain/errors.js';
import {
  CsvImportError,
  EntityValidationError,
  ForbiddenAccess,
  InvalidTemporaryKeyError,
  LocaleFormatError,
  LocaleNotSupportedError,
} from '../../../src/shared/domain/errors.js';
import { expect } from '../../test-helper.js';

describe('Unit | Domain | Errors', function () {
  it('should export a AdminMemberError', function () {
    expect(AdminMemberError).to.exist;
  });

  it('should export a CandidateAlreadyLinkedToUserError', function () {
    expect(errors.CandidateAlreadyLinkedToUserError).to.exist;
  });

  it('should export a CertificationCandidateByPersonalInfoNotFoundError', function () {
    expect(errors.CertificationCandidateByPersonalInfoNotFoundError).to.exist;
  });

  it('should export a CertificationCandidateByPersonalInfoTooManyMatchesError', function () {
    expect(errors.CertificationCandidateByPersonalInfoTooManyMatchesError).to.exist;
  });

  it('should export a CertificationCandidateCreationOrUpdateError', function () {
    expect(errors.CertificationCandidateCreationOrUpdateError).to.exist;
  });

  it('should export a CertificationCandidateDeletionError', function () {
    expect(errors.CertificationCandidateDeletionError).to.exist;
  });

  it('should export a CertificationCandidateMultipleUserLinksWithinSessionError', function () {
    expect(errors.CertificationCandidateMultipleUserLinksWithinSessionError).to.exist;
  });

  it('should export a CertificationCandidatePersonalInfoFieldMissingError', function () {
    expect(errors.CertificationCandidatePersonalInfoFieldMissingError).to.exist;
  });

  it('should export a CertificationCandidatePersonalInfoWrongFormat', function () {
    expect(errors.CertificationCandidatePersonalInfoWrongFormat).to.exist;
  });

  it('should export a NotFoundError', function () {
    expect(errors.NotFoundError).to.exist;
  });

  it('should export a UserAlreadyLinkedToCandidateInSessionError', function () {
    expect(errors.UserAlreadyLinkedToCandidateInSessionError).to.exist;
  });

  it('should export a UserNotAuthorizedToUpdateCampaignError', function () {
    expect(errors.UserNotAuthorizedToUpdateCampaignError).to.exist;
  });

  it('should export a AuthenticationMethodNotFoundError', function () {
    expect(errors.AuthenticationMethodNotFoundError).to.exist;
  });

  it('should export a AuthenticationMethodAlreadyExistsError', function () {
    expect(errors.AuthenticationMethodAlreadyExistsError).to.exist;
  });

  it('should export a CampaignTypeError', function () {
    expect(errors.CampaignTypeError).to.exist;
  });

  describe('#UserNotFoundError', function () {
    it('should export a UserNotFoundError', function () {
      expect(errors.UserNotFoundError).to.exist;
    });

    it('should have a getErrorMessage method', function () {
      // given
      const expectedErrorMessage = {
        data: {
          id: ['Ce compte est introuvable.'],
        },
      };

      // then
      const userNotFoundError = new errors.UserNotFoundError();
      expect(userNotFoundError.getErrorMessage).to.be.a('function');
      expect(userNotFoundError.getErrorMessage()).to.eql(expectedErrorMessage);
    });
  });

  it('should export a TargetProfileInvalidError', function () {
    expect(errors.TargetProfileInvalidError).to.exist;
  });

  describe('#InvalidTemporaryKeyError', function () {
    it('should export a InvalidTemporaryKeyError', function () {
      expect(InvalidTemporaryKeyError).to.exist;
    });

    it('should have a getErrorMessage method', function () {
      // given
      const expectedErrorMessage = {
        data: {
          temporaryKey: ['Cette demande de réinitialisation n’est pas valide.'],
        },
      };

      // then
      const error = new InvalidTemporaryKeyError();
      expect(error.getErrorMessage).to.be.a('function');
      expect(error.getErrorMessage()).to.eql(expectedErrorMessage);
    });
  });

  describe('#UserNotAuthorizedToCertifyError', function () {
    it('should export a UserNotAuthorizedToCertifyError', function () {
      expect(errors.UserNotAuthorizedToCertifyError).to.exist;
    });

    it('should have a getErrorMessage method', function () {
      // given
      const expectedErrorMessage = {
        data: {
          authorization: ['Vous n’êtes pas autorisé à passer un test de certification.'],
        },
      };

      // then
      const error = new errors.UserNotAuthorizedToCertifyError();
      expect(error.getErrorMessage).to.be.a('function');
      expect(error.getErrorMessage()).to.eql(expectedErrorMessage);
    });
  });

  describe('#AssessmentEndedError', function () {
    it('should export an AssessmentEndedError', function () {
      expect(errors.AssessmentEndedError).to.exist;
    });

    it('should have a getErrorMessage method', function () {
      // given
      const expectedErrorMessage = {
        data: {
          error: ["L'évaluation est terminée. Nous n'avons plus de questions à vous poser."],
        },
      };

      // then
      const AssessmentEndedError = new errors.AssessmentEndedError();
      expect(AssessmentEndedError.getErrorMessage).to.be.a('function');
      expect(AssessmentEndedError.getErrorMessage()).to.eql(expectedErrorMessage);
    });
  });

  describe('EntityValidationError', function () {
    context('#fromJoiErrors', function () {
      it('should populate the invalidAttributes key', function () {
        //given
        const joiErrors = [
          {
            context: {
              key: 'name',
            },
            message: 'name should not be empty',
          },
          {
            context: {
              key: 'email',
            },
            message: 'email is not a valid email address',
          },
        ];

        // when
        const error = EntityValidationError.fromJoiErrors(joiErrors);

        // then
        expect(error.invalidAttributes).to.deep.equal([
          {
            attribute: 'name',
            message: 'name should not be empty',
          },
          {
            attribute: 'email',
            message: 'email is not a valid email address',
          },
        ]);
      });
    });

    context('#fromEntityValidationError', function () {
      it('should populate the invalidAttributes key', function () {
        //given
        const error1 = new EntityValidationError({
          invalidAttributes: [
            {
              attribute: 'name',
              message: 'name should not be empty',
            },
            {
              attribute: 'email',
              message: 'email is not a valid email address',
            },
          ],
        });
        const error2 = new EntityValidationError({
          invalidAttributes: [
            {
              attribute: 'card',
              message: 'card should have money on it',
            },
            {
              attribute: 'token',
              message: 'token should be valid',
            },
          ],
        });

        // when
        const error = EntityValidationError.fromMultipleEntityValidationErrors([error1, error2]);

        // then
        expect(error.invalidAttributes).to.deep.equal([
          {
            attribute: 'name',
            message: 'name should not be empty',
          },
          {
            attribute: 'email',
            message: 'email is not a valid email address',
          },
          {
            attribute: 'card',
            message: 'card should have money on it',
          },
          {
            attribute: 'token',
            message: 'token should be valid',
          },
        ]);
      });
    });
  });

  it('should export a OrganizationLearnersCouldNotBeSavedError', function () {
    expect(errors.OrganizationLearnersCouldNotBeSavedError).to.exist;
  });

  it('should export an OrganizationLearnerCannotBeDissociatedError', function () {
    expect(errors.OrganizationLearnerCannotBeDissociatedError).to.exist;
  });

  it('should export an AlreadyAcceptedOrCancelledInvitationError', function () {
    expect(errors.AlreadyAcceptedOrCancelledInvitationError).to.exist;
  });

  it('should export an MissingAttributesError', function () {
    expect(errors.MissingAttributesError).to.exist;
  });

  it('exports SendingEmailToInvalidEmailAddressError', function () {
    expect(errors.SendingEmailToInvalidEmailAddressError).to.exist;
  });

  it('exports LocaleFormatError', function () {
    expect(LocaleFormatError).to.exist;
  });

  it('exports LocaleNotSupportedError', function () {
    expect(LocaleNotSupportedError).to.exist;
  });

  it('NotEnoughDaysPassedBeforeResetCampaignParticipationError error should have the correct wording', function () {
    // given
    const expectedErrorMessage = `Il n'est pas possible de remettre à zéro votre parcours pour le moment.`;

    // when
    const error = new errors.NotEnoughDaysPassedBeforeResetCampaignParticipationError();

    // then
    expect(error.message).to.equal(expectedErrorMessage);
  });

  it('should export a CsvImportError', function () {
    expect(CsvImportError).to.exist;
  });

  it('should export a ForbiddenAccess', function () {
    expect(ForbiddenAccess).to.exist;
  });

  describe('#UnableToAttachChildOrganizationToParentOrganizationError', function () {
    it('exports UnableToAttachChildOrganizationToParentOrganizationError', function () {
      // then
      expect(UnableToAttachChildOrganizationToParentOrganizationError).to.exist;
    });
  });
});
