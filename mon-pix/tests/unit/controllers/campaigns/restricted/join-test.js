import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | campaigns/restricted/join', function() {
  setupTest();

  let controller;
  let storeStub;
  let sessionStub;
  let schoolingRegistration;

  beforeEach(function() {
    controller = this.owner.lookup('controller:campaigns.restricted.join');
    controller.transitionToRoute = sinon.stub();
    schoolingRegistration = { save: sinon.stub(), unloadRecord: sinon.stub() };
    const createschoolingRegistrationStub = sinon.stub().returns(schoolingRegistration);
    storeStub = { createRecord: createschoolingRegistrationStub };
    sessionStub = { data: { authenticated: { source: 'pix' } } };
    controller.set('store', storeStub);
    controller.set('session', sessionStub);
    controller.set('model', 'AZERTY999');
  });

  describe('#attemptNext', function() {

    it('should associate user with student and redirect to campaigns.start-or-resume', async function() {
      // given
      schoolingRegistration.save.resolves();

      // when
      await controller.actions.attemptNext.call(controller, schoolingRegistration);

      // then
      sinon.assert.calledOnce(schoolingRegistration.save);
      sinon.assert.calledWith(controller.transitionToRoute, 'campaigns.start-or-resume');
    });

    it('should display a not found error', async function() {
      // given
      schoolingRegistration.save.rejects({ errors: [{ status: '404' }] });

      // when
      await controller.actions.attemptNext.call(controller, schoolingRegistration);

      // then
      sinon.assert.calledOnce(schoolingRegistration.unloadRecord);
      expect(controller.get('errorMessage')).to.equal('Vous êtes un élève ? <br/> Vérifiez vos informations (prénom, nom et date de naissance) ou contactez un enseignant.<br/> <br/> Vous êtes un enseignant ? <br/> L‘accès à un parcours n‘est pas disponible pour le moment.');
      sinon.assert.notCalled(controller.transitionToRoute);
    });

    describe('When student is already reconciled in the same organization', async function() {

      describe('When student account is authenticated by email only', async function() {

        it('should return a conflict error and display the error message related to the short code R31)', async function() {
          // given
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'R31', value: 'j***@example.net' }
          };
          const expectedErrorMessage = 'Vous possédez déjà un compte Pix utilisé dans votre établissement scolaire, avec l‘adresse mail <br>j***@example.net.<br>Pour continuer, connectez-vous à ce compte ou demandez de l’aide à un enseignant.<br> (Code R31)';

          schoolingRegistration.save.rejects({ errors: [error] });

          // when
          await controller.actions.attemptNext.call(controller, schoolingRegistration);

          // then
          sinon.assert.calledOnce(schoolingRegistration.unloadRecord);
          expect(controller.get('errorMessage')).to.equal(expectedErrorMessage);
          sinon.assert.notCalled(controller.transitionToRoute);
          expect(controller.get('isLoading')).to.equal(false);
        });

      });

      describe('When student account is authenticated by username only', async function() {

        it('should return a conflict error and display the error message related to the short code R32)', async function() {
          // given
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'R32', value: 'j***.h***2' }
          };
          const expectedErrorMessage = 'Vous possédez déjà un compte Pix utilisé dans votre établissement scolaire, avec l‘identifiant<br>j***.h***2.<br>Pour continuer, connectez-vous à ce compte ou demandez de l‘aide à un enseignant.<br> (Code R32)';
          schoolingRegistration.save.rejects({ errors: [error] });

          // when
          await controller.actions.attemptNext.call(controller, schoolingRegistration);

          // then
          sinon.assert.calledOnce(schoolingRegistration.unloadRecord);
          expect(controller.get('errorMessage')).to.equal(expectedErrorMessage);
          sinon.assert.notCalled(controller.transitionToRoute);
          expect(controller.get('isLoading')).to.equal(false);
        });

      });

      describe('When student account is authenticated by SamlId only', async function() {

        it('should return a conflict error and display the error message related to the short code R33)', async function() {
          // given
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'R33', value: undefined }
          };
          const expectedErrorMessage = 'Vous possédez déjà un compte Pix via l’ENT. Utilisez-le pour rejoindre le parcours.';
          schoolingRegistration.save.rejects({ errors: [error] });

          // when
          await controller.actions.attemptNext.call(controller, schoolingRegistration);

          // then
          sinon.assert.calledOnce(schoolingRegistration.unloadRecord);
          expect(controller.get('errorMessage')).to.equal(expectedErrorMessage);
          sinon.assert.notCalled(controller.transitionToRoute);
          expect(controller.get('isLoading')).to.equal(false);
        });

      });

      describe('When student account is authenticated by SamlId and username', async function() {

        it('should return a conflict error and display the error message related to the short code R33)', async function() {
          // given
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'R33', value: undefined }
          };
          const expectedErrorMessage = 'Vous possédez déjà un compte Pix via l’ENT. Utilisez-le pour rejoindre le parcours.';
          schoolingRegistration.save.rejects({ errors: [error] });

          // when
          await controller.actions.attemptNext.call(controller, schoolingRegistration);

          // then
          sinon.assert.calledOnce(schoolingRegistration.unloadRecord);
          expect(controller.get('errorMessage')).to.equal(expectedErrorMessage);
          sinon.assert.notCalled(controller.transitionToRoute);
          expect(controller.get('isLoading')).to.equal(false);
        });

      });

      describe('When student account is authenticated by SamlId and email', async function() {

        it('should return a conflict error and display the error message related to the short code R33)', async function() {
          // given
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'R33', value: undefined }
          };
          const expectedErrorMessage = 'Vous possédez déjà un compte Pix via l’ENT. Utilisez-le pour rejoindre le parcours.';
          schoolingRegistration.save.rejects({ errors: [error] });

          // when
          await controller.actions.attemptNext.call(controller, schoolingRegistration);

          // then
          sinon.assert.calledOnce(schoolingRegistration.unloadRecord);
          expect(controller.get('errorMessage')).to.equal(expectedErrorMessage);
          sinon.assert.notCalled(controller.transitionToRoute);
          expect(controller.get('isLoading')).to.equal(false);
        });

      });

      describe('When student account is authenticated by SamlId, email and username', async function() {

        it('should return a conflict error and display the error message related to the short code R33)', async function() {
          // given
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'R33', value: undefined }
          };
          const expectedErrorMessage = 'Vous possédez déjà un compte Pix via l’ENT. Utilisez-le pour rejoindre le parcours.';
          schoolingRegistration.save.rejects({ errors: [error] });

          // when
          await controller.actions.attemptNext.call(controller, schoolingRegistration);

          // then
          sinon.assert.calledOnce(schoolingRegistration.unloadRecord);
          expect(controller.get('errorMessage')).to.equal(expectedErrorMessage);
          sinon.assert.notCalled(controller.transitionToRoute);
          expect(controller.get('isLoading')).to.equal(false);
        });

      });

      describe('When student account is authenticated by email and username', async function() {

        it('should return a conflict error and display the error message related to the short code R32)', async function() {
          // given
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_THE_SAME_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans le même établissement.',
            meta: { shortCode: 'R32', value: 'j***.h***2' }
          };
          const expectedErrorMessage = 'Vous possédez déjà un compte Pix utilisé dans votre établissement scolaire, avec l‘identifiant<br>j***.h***2.<br>Pour continuer, connectez-vous à ce compte ou demandez de l‘aide à un enseignant.<br> (Code R32)';
          schoolingRegistration.save.rejects({ errors: [error] });

          // when
          await controller.actions.attemptNext.call(controller, schoolingRegistration);

          // then
          sinon.assert.calledOnce(schoolingRegistration.unloadRecord);
          expect(controller.get('errorMessage')).to.equal(expectedErrorMessage);
          sinon.assert.notCalled(controller.transitionToRoute);
          expect(controller.get('isLoading')).to.equal(false);
        });

      });

    });

    describe('When student is already reconciled in others organization', async function() {

      describe('When student account is authenticated by email only', async function() {

        it('should return a conflict error and display the error message related to the short code R11)', async function() {
          // given
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'R11', value: 'j***@example.net' }
          };
          const expectedErrorMessage = 'Vous possédez déjà un compte Pix avec l’adresse e-mail <br>j***@example.net<br>Pour continuer, connectez-vous à ce compte ou demandez de l’aide à un enseignant.<br>(Code R11)';
          schoolingRegistration.save.rejects({ errors: [error] });

          // when
          await controller.actions.attemptNext.call(controller, schoolingRegistration);

          // then
          sinon.assert.calledOnce(schoolingRegistration.unloadRecord);
          expect(controller.get('errorMessage')).to.equal(expectedErrorMessage);
          sinon.assert.notCalled(controller.transitionToRoute);
          expect(controller.get('isLoading')).to.equal(false);
        });

      });

      describe('When student account is authenticated by username only', async function() {

        it('should return a conflict error and display the error message related to the short code R12)', async function() {
          // given
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'R12', value: 'j***.h***2' }
          };
          const expectedErrorMessage = 'Vous possédez déjà un compte Pix utilisé avec l’identifiant <br>j***.h***2<br>Pour continuer, connectez-vous à ce compte ou demandez de l’aide à un enseignant.<br>(Code R12)';
          schoolingRegistration.save.rejects({ errors: [error] });

          // when
          await controller.actions.attemptNext.call(controller, schoolingRegistration);

          // then
          sinon.assert.calledOnce(schoolingRegistration.unloadRecord);
          expect(controller.get('errorMessage')).to.equal(expectedErrorMessage);
          sinon.assert.notCalled(controller.transitionToRoute);
          expect(controller.get('isLoading')).to.equal(false);
        });

      });

      describe('When student account is authenticated by SamlId only', async function() {

        it('should return a conflict error and display the error message related to the short code R13)', async function() {
          // given
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'R13', value: undefined }
          };
          const expectedErrorMessage = 'Vous possédez déjà un compte Pix via l‘ENT dans un autre établissement scolaire.<br>Pour continuer, contactez un enseignant qui pourra vous donner l’accès à ce compte à l‘aide de Pix Orga.';
          schoolingRegistration.save.rejects({ errors: [error] });

          // when
          await controller.actions.attemptNext.call(controller, schoolingRegistration);

          // then
          sinon.assert.calledOnce(schoolingRegistration.unloadRecord);
          expect(controller.get('errorMessage')).to.equal(expectedErrorMessage);
          sinon.assert.notCalled(controller.transitionToRoute);
          expect(controller.get('isLoading')).to.equal(false);
        });

      });

      describe('When student account is authenticated by SamlId and username', async function() {

        it('should return a conflict error and display the error message related to the short code R13)', async function() {
          // given
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'R13', value: undefined }
          };
          const expectedErrorMessage = 'Vous possédez déjà un compte Pix via l‘ENT dans un autre établissement scolaire.<br>Pour continuer, contactez un enseignant qui pourra vous donner l’accès à ce compte à l‘aide de Pix Orga.';
          schoolingRegistration.save.rejects({ errors: [error] });

          // when
          await controller.actions.attemptNext.call(controller, schoolingRegistration);

          // then
          sinon.assert.calledOnce(schoolingRegistration.unloadRecord);
          expect(controller.get('errorMessage')).to.equal(expectedErrorMessage);
          sinon.assert.notCalled(controller.transitionToRoute);
          expect(controller.get('isLoading')).to.equal(false);
        });

      });

      describe('When student account is authenticated by SamlId and email', async function() {

        it('should return a conflict error and display the error message related to the short code R13)', async function() {
          // given
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'R13', value: undefined }
          };
          const expectedErrorMessage = 'Vous possédez déjà un compte Pix via l‘ENT dans un autre établissement scolaire.<br>Pour continuer, contactez un enseignant qui pourra vous donner l’accès à ce compte à l‘aide de Pix Orga.';
          schoolingRegistration.save.rejects({ errors: [error] });

          // when
          await controller.actions.attemptNext.call(controller, schoolingRegistration);

          // then
          sinon.assert.calledOnce(schoolingRegistration.unloadRecord);
          expect(controller.get('errorMessage')).to.equal(expectedErrorMessage);
          sinon.assert.notCalled(controller.transitionToRoute);
          expect(controller.get('isLoading')).to.equal(false);
        });

      });

      describe('When student account is authenticated by SamlId, username and email', async function() {

        it('should return a conflict error and display the error message related to the short code R13)', async function() {
          // given
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'R13', value: undefined }
          };
          const expectedErrorMessage = 'Vous possédez déjà un compte Pix via l‘ENT dans un autre établissement scolaire.<br>Pour continuer, contactez un enseignant qui pourra vous donner l’accès à ce compte à l‘aide de Pix Orga.';
          schoolingRegistration.save.rejects({ errors: [error] });

          // when
          await controller.actions.attemptNext.call(controller, schoolingRegistration);

          // then
          sinon.assert.calledOnce(schoolingRegistration.unloadRecord);
          expect(controller.get('errorMessage')).to.equal(expectedErrorMessage);
          sinon.assert.notCalled(controller.transitionToRoute);
          expect(controller.get('isLoading')).to.equal(false);
        });

      });

      describe('When student account is authenticated by username and email', async function() {

        it('should return a conflict error and display the error message related to the short code R12)', async function() {
          // given
          const error = {
            status: '409',
            code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
            title: 'Conflict',
            detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
            meta: { shortCode: 'R12', value: 'j***.h***2' }
          };
          const expectedErrorMessage = 'Vous possédez déjà un compte Pix utilisé avec l’identifiant <br>j***.h***2<br>Pour continuer, connectez-vous à ce compte ou demandez de l’aide à un enseignant.<br>(Code R12)';
          schoolingRegistration.save.rejects({ errors: [error] });

          // when
          await controller.actions.attemptNext.call(controller, schoolingRegistration);

          // then
          sinon.assert.calledOnce(schoolingRegistration.unloadRecord);
          expect(controller.get('errorMessage')).to.equal(expectedErrorMessage);
          sinon.assert.notCalled(controller.transitionToRoute);
          expect(controller.get('isLoading')).to.equal(false);
        });

      });

    });

  });
});
