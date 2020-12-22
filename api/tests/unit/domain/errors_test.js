const { expect } = require('../../test-helper');
const errors = require('../../../lib/domain/errors');

describe('Unit | Domain | Errors', () => {

  it('should export a CertificationCandidateAlreadyLinkedToUserError', () => {
    expect(errors.CertificationCandidateAlreadyLinkedToUserError).to.exist;
  });

  it('should export a CertificationCandidateByPersonalInfoNotFoundError', () => {
    expect(errors.CertificationCandidateByPersonalInfoNotFoundError).to.exist;
  });

  it('should export a CertificationCandidateByPersonalInfoTooManyMatchesError', () => {
    expect(errors.CertificationCandidateByPersonalInfoTooManyMatchesError).to.exist;
  });

  it('should export a CertificationCandidateCreationOrUpdateError', () => {
    expect(errors.CertificationCandidateCreationOrUpdateError).to.exist;
  });

  it('should export a CertificationCandidateDeletionError', () => {
    expect(errors.CertificationCandidateDeletionError).to.exist;
  });

  it('should export a CertificationCandidateMultipleUserLinksWithinSessionError', () => {
    expect(errors.CertificationCandidateMultipleUserLinksWithinSessionError).to.exist;
  });

  it('should export a CertificationCandidatePersonalInfoFieldMissingError', () => {
    expect(errors.CertificationCandidatePersonalInfoFieldMissingError).to.exist;
  });

  it('should export a CertificationCandidatePersonalInfoWrongFormat', () => {
    expect(errors.CertificationCandidatePersonalInfoWrongFormat).to.exist;
  });

  it('should export a CertificationCandidateForbiddenDeletionError', () => {
    expect(errors.CertificationCandidateForbiddenDeletionError).to.exist;
  });

  it('should export a NotFoundError', () => {
    expect(errors.NotFoundError).to.exist;
  });

  it('should export a InvalidCertificationReportForFinalization', () => {
    expect(errors.InvalidCertificationReportForFinalization).to.exist;
  });

  it('should export a InvalidParametersForSessionPublication', () => {
    expect(errors.InvalidParametersForSessionPublication).to.exist;
  });

  it('should export a UserAlreadyLinkedToCandidateInSessionError', () => {
    expect(errors.UserAlreadyLinkedToCandidateInSessionError).to.exist;
  });

  it('should export a ArchivedCampaignError', () => {
    expect(errors.ArchivedCampaignError).to.exist;
  });

  it('should export a UserNotAuthorizedToUpdatePasswordError', () => {
    expect(errors.UserNotAuthorizedToUpdatePasswordError).to.exist;
  });

  it('should export a UserNotAuthorizedToUpdateCampaignError', () => {
    expect(errors.UserNotAuthorizedToUpdateCampaignError).to.exist;
  });

  it('should export a CsvImportError', () => {
    expect(errors.CsvImportError).to.exist;
  });

  it('should export a AuthenticationMethodNotFoundError', () => {
    expect(errors.AuthenticationMethodNotFoundError).to.exist;
  });

  describe('#SameNationalStudentIdInOrganizationError', () => {

    context('When errorDetail is provided', () => {

      it('should return a message with given nationalStudentId', () => {
        // given
        const expectedErrorMessage = 'L’INE 123INE456 est déjà présent pour cette organisation.';
        const errorMessage = 'Key ("organizationId", "nationalStudentId")=(ORGAID, 123INE456) already exists.';

        // when
        const sameNationalStudentIdInOrganizationError = new errors.SameNationalStudentIdInOrganizationError(errorMessage);

        // then
        expect(sameNationalStudentIdInOrganizationError.message).to.equal(expectedErrorMessage);
      });

      it('should set a nationalStudentId property', () => {
        // given
        const errorMessage = 'Key ("organizationId", "nationalStudentId")=(ORGAID, 123INE456) already exists.';

        // when
        const sameNationalStudentIdInOrganizationError = new errors.SameNationalStudentIdInOrganizationError(errorMessage);

        // then
        expect(sameNationalStudentIdInOrganizationError.nationalStudentId).to.equal('123INE456');
      });
    });

    context('When errorDetail is not provided', () => {

      it('should return a generic message', () => {
        // given
        const expectedErrorMessage = 'Un INE est déjà présent pour cette organisation.';

        // when
        const sameNationalStudentIdInOrganizationError = new errors.SameNationalStudentIdInOrganizationError();

        // then
        expect(sameNationalStudentIdInOrganizationError.message).to.equal(expectedErrorMessage);
      });
    });
  });

  describe('#SameNationalStudentIdInFileError', () => {

    context('When errorDetail is provided', () => {

      it('should return a message with given nationalStudentId', () => {
        // given
        const expectedErrorMessage = 'L’INE 123INE456 est présent plusieurs fois dans le fichier. La base SIECLE doit être corrigée pour supprimer les doublons. Réimportez ensuite le nouveau fichier.';
        const nationalStudentId = '123INE456';

        // when
        const sameNationalStudentIdInOrganizationError = new errors.SameNationalStudentIdInFileError(nationalStudentId);

        // then
        expect(sameNationalStudentIdInOrganizationError.message).to.equal(expectedErrorMessage);
      });
    });

    context('When errorDetail is not provided', () => {

      it('should return a generic message', () => {
        // given
        const expectedErrorMessage = 'Un INE est présent plusieurs fois dans le fichier. La base SIECLE doit être corrigée pour supprimer les doublons. Réimportez ensuite le nouveau fichier.';

        // when
        const sameNationalStudentIdInOrganizationError = new errors.SameNationalStudentIdInFileError();

        // then
        expect(sameNationalStudentIdInOrganizationError.message).to.equal(expectedErrorMessage);
      });
    });
  });

  describe('#UserNotFoundError', () => {
    it('should export a UserNotFoundError', () => {
      expect(errors.UserNotFoundError).to.exist;
    });

    it('should have a getErrorMessage method', () => {
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

  describe('#PasswordResetDemandNotFoundError', () => {
    it('should export a PasswordResetDemandNotFoundError', () => {
      expect(errors.PasswordResetDemandNotFoundError).to.exist;
    });

    it('should have a getErrorMessage method', () => {
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

  it('should export a SessionAlreadyFinalizedError', () => {
    expect(errors.SessionAlreadyFinalizedError).to.exist;
  });

  it('should export a TargetProfileInvalidError', () => {
    expect(errors.TargetProfileInvalidError).to.exist;
  });

  describe('#InvalidTemporaryKeyError', () => {
    it('should export a InvalidTemporaryKeyError', () => {
      expect(errors.InvalidTemporaryKeyError).to.exist;
    });

    it('should have a getErrorMessage method', () => {
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

  describe('#UserNotAuthorizedToCertifyError', () => {
    it('should export a UserNotAuthorizedToCertifyError', () => {
      expect(errors.UserNotAuthorizedToCertifyError).to.exist;
    });

    it('should have a getErrorMessage method', () => {
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

  describe('#AssessmentEndedError', () => {
    it('should export an AssessmentEndedError', () => {
      expect(errors.AssessmentEndedError).to.exist;
    });

    it('should have a getErrorMessage method', () => {
      // given
      const expectedErrorMessage = {
        data: {
          error: ['L\'évaluation est terminée. Nous n\'avons plus de questions à vous poser.'],
        },
      };

      // then
      const AssessmentEndedError = new errors.AssessmentEndedError();
      expect(AssessmentEndedError.getErrorMessage).to.be.a('function');
      expect(AssessmentEndedError.getErrorMessage()).to.eql(expectedErrorMessage);
    });
  });

  describe('EntityValidationError', () => {

    context('#fromJoiErrors', () => {

      it('should populate the invalidAttributes key', () => {
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

    context('#fromEntityValidationError', () => {

      it('should populate the invalidAttributes key', () => {
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

  describe('InvalidCertificationCandidate', () => {

    context('#fromJoiErrorDetail', () => {

      it('should return an InvalidCertificationCandidateError', () => {
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

      it('should assign key from joiErrorDetail context', () => {
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

      [
        { type: 'any.required', why: 'required' },
        { type: 'date.format', why: 'date_format' },
        { type: 'date.base', why: 'not_a_date' },
        { type: 'string.email', why: 'email_format' },
        { type: 'string.base', why: 'not_a_string' },
        { type: 'number.base', why: 'not_a_number' },
        { type: 'number.integer', why: 'not_a_number' },
      ].forEach(({ type, why }) => {
        it(`should assign why "${why}" to error when joi error type is "${type}"`, async () => {
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

      it('should let why empty when type is unknown', async () => {
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

  describe('CertificationCandidatesImportError', () => {

    context('#fromInvalidCertificationCandidateError', () => {

      it('should return a CertificationCandidatesImportError', () => {
        // given
        const invalidCertificationCandidateError = {
          key: 'someKey',
          why: 'someWhy',
        };

        // when
        const error = errors.CertificationCandidatesImportError.fromInvalidCertificationCandidateError(invalidCertificationCandidateError, {}, 1);

        // then
        expect(error).to.be.instanceOf(errors.CertificationCandidatesImportError);
      });

      it('should start the error message with line number', () => {
        // given
        const lineNumber = 20;
        const invalidCertificationCandidateError = {
          key: 'someKey',
          why: 'someWhy',
        };

        // when
        const error = errors.CertificationCandidatesImportError.fromInvalidCertificationCandidateError(invalidCertificationCandidateError, {}, lineNumber);

        // then
        expect(error.message.startsWith(`Ligne ${lineNumber} :`)).to.be.true;
      });

      context('when err.why is known', () => {

        it('should include the right label when found in the keyLabelMap', () => {
          // given
          const lineNumber = 20;
          const invalidCertificationCandidateError = {
            key: 'someKey',
            why: 'not_a_date',
          };
          const keyLabelMap = {
            'someKey': 'someLabel',
            'someOtherKey': 'someOtherLabel',
          };

          // when
          const error = errors.CertificationCandidatesImportError.fromInvalidCertificationCandidateError(invalidCertificationCandidateError, keyLabelMap, lineNumber);

          // then
          expect(error.message).to.contain('Le champ “someLabel”');
        });

        [
          { why: 'not_a_date', content: 'doit être au format jj/mm/aaaa.' },
          { why: 'date_format', content: 'doit être au format jj/mm/aaaa.' },
          { why: 'email_format', content: 'doit être au format email.' },
          { why: 'not_a_string', content: 'doit être une chaîne de caractères.' },
          { why: 'not_a_number', content: 'doit être un nombre.' },
          { why: 'required', content: 'est obligatoire.' },
        ].forEach(({ why, content }) => {
          it(`message should contain "${content}" when why is "${why}"`, async () => {
            // given
            const invalidCertificationCandidateError = {
              key: 'someKey',
              why,
            };
            const keyLabelMap = {
              'someKey': 'someLabel',
            };

            // when
            const error = errors.CertificationCandidatesImportError.fromInvalidCertificationCandidateError(invalidCertificationCandidateError, keyLabelMap, 1);

            // then
            expect(error.message.endsWith(content)).to.be.true;
          });
        });
      });

      context('when err.why is unknown', () => {

        it('should display generic message', () => {
          // given
          const invalidCertificationCandidateError = {
            key: 'someKey',
            why: 'unknown',
          };
          const keyLabelMap = {
            'someKey': 'someLabel',
          };

          // when
          const error = errors.CertificationCandidatesImportError.fromInvalidCertificationCandidateError(invalidCertificationCandidateError, keyLabelMap, 1);

          // then
          expect(error.message).to.contain('Quelque chose s\'est mal passé. Veuillez réessayer');
        });
      });
    });
  });
});
