import { expect } from '../../test-helper.js';
import * as errors from '../../../lib/domain/errors.js';
import { NotEnoughDaysPassedBeforeResetCampaignParticipationError } from '../../../lib/domain/errors.js';
import {
  CsvImportError,
  EntityValidationError,
  ForbiddenAccess,
  InvalidTemporaryKeyError,
  LocaleFormatError,
  LocaleNotSupportedError,
} from '../../../src/shared/domain/errors.js';
import { AdminMemberError } from '../../../src/authorization/domain/errors.js';

describe('Unit | Domain | Errors', function () {
  it('should export a AdminMemberError', function () {
    expect(AdminMemberError).to.exist;
  });

  it('should export a CertificationCandidateAlreadyLinkedToUserError', function () {
    expect(errors.CertificationCandidateAlreadyLinkedToUserError).to.exist;
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

  it('should export a CertificationCandidateForbiddenDeletionError', function () {
    expect(errors.CertificationCandidateForbiddenDeletionError).to.exist;
  });

  it('should export a NotFoundError', function () {
    expect(errors.NotFoundError).to.exist;
  });

  it('should export a InvalidCertificationReportForFinalization', function () {
    expect(errors.InvalidCertificationReportForFinalization).to.exist;
  });

  it('should export a UserAlreadyLinkedToCandidateInSessionError', function () {
    expect(errors.UserAlreadyLinkedToCandidateInSessionError).to.exist;
  });

  it('should export a ArchivedCampaignError', function () {
    expect(errors.ArchivedCampaignError).to.exist;
  });

  it('should export a CampaignParticipationDeletedError', function () {
    expect(errors.CampaignParticipationDeletedError).to.exist;
  });

  it('should export a UserNotAuthorizedToUpdatePasswordError', function () {
    expect(errors.UserNotAuthorizedToUpdatePasswordError).to.exist;
  });

  it('should export a UserNotAuthorizedToUpdateCampaignError', function () {
    expect(errors.UserNotAuthorizedToUpdateCampaignError).to.exist;
  });

  it('should export a SiecleXmlImportError', function () {
    expect(errors.SiecleXmlImportError).to.exist;
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

  it('should export a SessionNotAccessible error', function () {
    expect(errors.SessionNotAccessible).to.exist;
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

  describe('#PasswordResetDemandNotFoundError', function () {
    it('should export a PasswordResetDemandNotFoundError', function () {
      expect(errors.PasswordResetDemandNotFoundError).to.exist;
    });

    it('should have a getErrorMessage method', function () {
      // given
      const expectedErrorMessage = {
        data: {
          temporaryKey: ['Cette demande de réinitialisation n’existe pas.'],
        },
      };

      // then
      const error = new errors.PasswordResetDemandNotFoundError();
      expect(error.getErrorMessage).to.be.a('function');
      expect(error.getErrorMessage()).to.eql(expectedErrorMessage);
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

  describe('InvalidCertificationCandidate', function () {
    context('#fromJoiErrorDetail', function () {
      it('should return an InvalidCertificationCandidateError', function () {
        // given
        const joiErrorDetail = {
          context: { key: 'someKey' },
          type: 'someType',
        };

        // when
        const error = errors.InvalidCertificationCandidate.fromJoiErrorDetail(joiErrorDetail);

        // then
        expect(error).to.be.instanceOf(errors.InvalidCertificationCandidate);
      });

      it('should assign key from joiErrorDetail context', function () {
        // given
        const joiErrorDetail = {
          context: { key: 'someKey' },
          type: 'someType',
        };

        // when
        const error = errors.InvalidCertificationCandidate.fromJoiErrorDetail(joiErrorDetail);

        // then
        expect(error.key).to.equal(joiErrorDetail.context.key);
      });

      // Rule disabled to allow dynamic generated tests. See https://github.com/lo1tuma/eslint-plugin-mocha/blob/master/docs/rules/no-setup-in-describe.md#disallow-setup-in-describe-blocks-mochano-setup-in-describe
      // eslint-disable-next-line mocha/no-setup-in-describe
      [
        { type: 'any.required', why: 'required' },
        { type: 'date.format', why: 'date_format' },
        { type: 'date.base', why: 'not_a_date' },
        { type: 'string.email', why: 'email_format' },
        { type: 'string.base', why: 'not_a_string' },
        { type: 'number.base', why: 'not_a_number' },
        { type: 'number.integer', why: 'not_a_number' },
      ].forEach(({ type, why }) => {
        it(`should assign why "${why}" to error when joi error type is "${type}"`, async function () {
          // given
          const joiErrorDetail = {
            context: { key: 'someKey' },
            type,
          };

          // when
          const error = errors.InvalidCertificationCandidate.fromJoiErrorDetail(joiErrorDetail);

          // then
          expect(error.why).to.equal(why);
        });
      });

      it('should let why empty when type is unknown', async function () {
        // given
        const joiErrorDetail = {
          context: { key: 'someKey' },
          type: 'someUnknownType',
        };

        // when
        const error = errors.InvalidCertificationCandidate.fromJoiErrorDetail(joiErrorDetail);

        // then
        expect(error.why).to.be.null;
      });
    });
  });

  it('should export a UnknownCountryForStudentEnrolmentError', function () {
    expect(errors.UnknownCountryForStudentEnrolmentError).to.exist;
  });

  it('should export a OrganizationLearnersCouldNotBeSavedError', function () {
    expect(errors.OrganizationLearnersCouldNotBeSavedError).to.exist;
  });

  it('should export an InvalidVerificationCodeError', function () {
    expect(errors.InvalidVerificationCodeError).to.exist;
  });

  it('should export an EmailModificationDemandNotFoundOrExpiredError', function () {
    expect(errors.EmailModificationDemandNotFoundOrExpiredError).to.exist;
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

  it('should export an DifferentExternalIdentifierError', function () {
    expect(errors.DifferentExternalIdentifierError).to.exist;
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
    const error = new NotEnoughDaysPassedBeforeResetCampaignParticipationError();

    // then
    expect(error.message).to.equal(expectedErrorMessage);
  });

  it('should export a CsvImportError', function () {
    expect(CsvImportError).to.exist;
  });

  it('should export a ForbiddenAccess', function () {
    expect(ForbiddenAccess).to.exist;
  });
});
