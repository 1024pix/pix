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

  it('should export a InvalidCertificationCandidate', () => {
    expect(errors.InvalidCertificationCandidate).to.exist;
  });

  it('should export a UserAlreadyLinkedToCandidateInSessionError', () => {
    expect(errors.UserAlreadyLinkedToCandidateInSessionError).to.exist;
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

  describe('#internalError', () => {
    it('should export a internalError', () => {
      expect(errors.InternalError).to.exist;
    });

    it('should have a getErrorMessage method', () => {
      // given
      const expectedErrorMessage = {
        data: {
          error: ['Une erreur interne est survenue.'],
        },
      };

      // then
      const internalError = new errors.InternalError();
      expect(internalError.getErrorMessage).to.be.a('function');
      expect(internalError.getErrorMessage()).to.eql(expectedErrorMessage);
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
      const internalError = new errors.PasswordResetDemandNotFoundError();
      expect(internalError.getErrorMessage).to.be.a('function');
      expect(internalError.getErrorMessage()).to.eql(expectedErrorMessage);
    });
  });

  it('should export a SessionAlreadyFinalizedError', () => {
    expect(errors.SessionAlreadyFinalizedError).to.exist;
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
      const internalError = new errors.InvalidTemporaryKeyError();
      expect(internalError.getErrorMessage).to.be.a('function');
      expect(internalError.getErrorMessage()).to.eql(expectedErrorMessage);
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
      const internalError = new errors.UserNotAuthorizedToCertifyError();
      expect(internalError.getErrorMessage).to.be.a('function');
      expect(internalError.getErrorMessage()).to.eql(expectedErrorMessage);
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
});
