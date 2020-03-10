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

  it('should export a CampaignAlreadyArchivedError',() => {
    expect(errors.CampaignAlreadyArchivedError).to.exist;
  });

  it('should export a UserNotAuthorizedToUpdateStudentPassword', () => {
    expect(errors.UserNotAuthorizedToUpdateStudentPasswordError).to.exist;
  });

  it('should export a UserNotAuthorizedToUpdateCampaignError', () => {
    expect(errors.UserNotAuthorizedToUpdateCampaignError).to.exist;
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
});
