const { expect } = require('../../test-helper');
const errors = require('../../../lib/domain/errors');

describe('Unit | Domain | Errors', function () {
  it('should export a AdminMemberError', function () {
    expect(errors.AdminMemberError).to.exist;
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

  it('should export a UserNotAuthorizedToFindTrainings', function () {
    expect(errors.UserNotAuthorizedToFindTrainings).to.exist;
  });

  it('should export a CsvImportError', function () {
    expect(errors.CsvImportError).to.exist;
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

  it('should export a SessionAlreadyFinalizedError', function () {
    expect(errors.SessionAlreadyFinalizedError).to.exist;
  });

  it('should export a SessionWithoutStartedCertificationError', function () {
    expect(errors.SessionWithoutStartedCertificationError).to.exist;
  });

  it('should export a SessionWithAbortReasonOnCompletedCertificationCourseError', function () {
    expect(errors.SessionWithAbortReasonOnCompletedCertificationCourseError).to.exist;
  });

  it('should export a TargetProfileInvalidError', function () {
    expect(errors.TargetProfileInvalidError).to.exist;
  });

  describe('#InvalidTemporaryKeyError', function () {
    it('should export a InvalidTemporaryKeyError', function () {
      expect(errors.InvalidTemporaryKeyError).to.exist;
    });

    it('should have a getErrorMessage method', function () {
      // given
      const expectedErrorMessage = {
        data: {
          temporaryKey: ['Cette demande de réinitialisation n’est pas valide.'],
        },
      };

      // then
      const error = new errors.InvalidTemporaryKeyError();
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
        const error = errors.EntityValidationError.fromJoiErrors(joiErrors);

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
        const error1 = new errors.EntityValidationError({
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
        const error2 = new errors.EntityValidationError({
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
        const error = errors.EntityValidationError.fromMultipleEntityValidationErrors([error1, error2]);

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

  describe('CertificationCandidatesImportError', function () {
    context('#fromInvalidCertificationCandidateError', function () {
      it('should return a CertificationCandidatesImportError', function () {
        // given
        const invalidCertificationCandidateError = {
          key: 'someKey',
          why: 'someWhy',
        };

        // when
        const error = errors.CertificationCandidatesImportError.fromInvalidCertificationCandidateError(
          invalidCertificationCandidateError,
          {},
          1
        );

        // then
        expect(error).to.be.instanceOf(errors.CertificationCandidatesImportError);
      });

      it('should start the error message with line number', function () {
        // given
        const lineNumber = 20;
        const invalidCertificationCandidateError = {
          key: 'someKey',
          why: 'someWhy',
        };

        // when
        const error = errors.CertificationCandidatesImportError.fromInvalidCertificationCandidateError(
          invalidCertificationCandidateError,
          {},
          lineNumber
        );

        // then
        expect(error.message.startsWith(`Ligne ${lineNumber} :`)).to.be.true;
      });

      context('when err.why is known', function () {
        it('should include the right label when found in the keyLabelMap', function () {
          // given
          const lineNumber = 20;
          const invalidCertificationCandidateError = {
            key: 'someKey',
            why: 'not_a_date',
          };
          const keyLabelMap = {
            someKey: 'someLabel',
            someOtherKey: 'someOtherLabel',
          };

          // when
          const error = errors.CertificationCandidatesImportError.fromInvalidCertificationCandidateError(
            invalidCertificationCandidateError,
            keyLabelMap,
            lineNumber
          );

          // then
          expect(error.message).to.contain('Le champ “someLabel”');
        });

        // eslint-disable-next-line mocha/no-setup-in-describe
        [
          { why: 'not_a_date', content: 'doit être au format jj/mm/aaaa.' },
          { why: 'date_format', content: 'doit être au format jj/mm/aaaa.' },
          { why: 'email_format', content: 'doit être au format email.' },
          { why: 'not_a_string', content: 'doit être une chaîne de caractères.' },
          { why: 'not_a_number', content: 'doit être un nombre.' },
          { why: 'required', content: 'est obligatoire.' },
        ].forEach(({ why, content }) => {
          it(`message should contain "${content}" when why is "${why}"`, async function () {
            // given
            const invalidCertificationCandidateError = {
              key: 'someKey',
              why,
            };
            const keyLabelMap = {
              someKey: 'someLabel',
            };

            // when
            const error = errors.CertificationCandidatesImportError.fromInvalidCertificationCandidateError(
              invalidCertificationCandidateError,
              keyLabelMap,
              1
            );

            // then
            expect(error.message.endsWith(content)).to.be.true;
          });
        });
      });

      context('when err.why is unknown', function () {
        it('should display generic message', function () {
          // given
          const invalidCertificationCandidateError = {
            key: 'someKey',
            why: 'unknown',
          };
          const keyLabelMap = {
            someKey: 'someLabel',
          };

          // when
          const error = errors.CertificationCandidatesImportError.fromInvalidCertificationCandidateError(
            invalidCertificationCandidateError,
            keyLabelMap,
            1
          );

          // then
          expect(error.message).to.contain("Quelque chose s'est mal passé. Veuillez réessayer");
        });
      });
    });
  });

  it('should export a UnknownCountryForStudentEnrollmentError', function () {
    expect(errors.UnknownCountryForStudentEnrollmentError).to.exist;
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

  describe('CertificationCandidateAddError', function () {
    context('#fromInvalidCertificationCandidateError', function () {
      it('should return a CertificationCandidateAddError', function () {
        // given
        const invalidCertificationCandidateError = {
          key: 'someKey',
          why: 'someWhy',
        };

        // when
        const error = errors.CertificationCandidateAddError.fromInvalidCertificationCandidateError(
          invalidCertificationCandidateError,
          {},
          1
        );

        // then
        expect(error).to.be.instanceOf(errors.CertificationCandidateAddError);
      });

      context('when err.why is known', function () {
        // eslint-disable-next-line mocha/no-setup-in-describe
        [
          {
            why: 'not_a_billing_mode',
            message: `Le champ “Tarification part Pix” ne peut contenir qu'une des valeurs suivantes: Gratuite, Payante ou Prépayée.`,
          },
          {
            why: 'prepayment_code_null',
            message: `Le champ “Code de prépaiement” est obligatoire puisque l’option “Prépayée” a été sélectionnée pour ce candidat.`,
          },
          {
            why: 'prepayment_code_not_null',
            message: `Le champ “Code de prépaiement” doit rester vide puisque l’option “Prépayée” n'a pas été sélectionnée pour ce candidat.`,
          },
        ].forEach(({ why, message }) => {
          it(`message should be "${message}" when why is "${why}"`, async function () {
            // given
            const invalidCertificationCandidateError = { why };

            // when
            const error = errors.CertificationCandidateAddError.fromInvalidCertificationCandidateError(
              invalidCertificationCandidateError
            );

            // then
            expect(error.message).to.equal(message);
          });
        });
      });

      context('when err.why is unknown', function () {
        it('should display generic message', function () {
          // given
          const invalidCertificationCandidateError = {
            key: 'someKey',
            why: 'unknown',
          };

          // when
          const error = errors.CertificationCandidateAddError.fromInvalidCertificationCandidateError(
            invalidCertificationCandidateError
          );

          // then
          expect(error.message).to.contain('Candidat de certification invalide.');
        });
      });
    });
  });

  it('should export an DifferentExternalIdentifierError', function () {
    expect(errors.DifferentExternalIdentifierError).to.exist;
  });

  it('exports SendingEmailToInvalidEmailAddressError', function () {
    expect(errors.SendingEmailToInvalidEmailAddressError).to.exist;
  });
});
