import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

import createComponent from '../../../../../helpers/create-glimmer-component';

import { getJoinErrorsMessageByShortCode } from 'mon-pix/utils/errors-messages';

describe('Unit | Component | routes/campaigns/restricted/join-sco', function() {

  setupTest();

  let component;
  let storeStub;
  let onSubmitToReconcileStub;
  let onSubmitToCreateAndReconcileStub;
  let sessionStub;
  let eventStub;
  let record;

  beforeEach(function() {
    record = { unloadRecord: sinon.stub() };
    storeStub = { createRecord: sinon.stub().returns(record) };
    sessionStub = { data: { authenticated: { source: 'pix' } }, get: sinon.stub() };
    onSubmitToReconcileStub = sinon.stub();
    onSubmitToCreateAndReconcileStub = sinon.stub();
    eventStub = { preventDefault: sinon.stub() };
    component = createComponent('component:routes/campaigns/restricted/join-sco', {
      onSubmitToReconcile: onSubmitToReconcileStub,
      onSubmitToCreateAndReconcile: onSubmitToCreateAndReconcileStub,
      campaignCode: 123,
    });
    component.store = storeStub;
    component.session = sessionStub;
  });

  describe('#triggerInputDayValidation', function() {
    context('when dayOfBirth is invalid', function() {

      [
        '',
        ' ',
        '32',
        '0',
        '444',
        'ee',
      ].forEach(function(wrongDayOfBirth) {
        it(`should display an error when dayOfBirth is ${wrongDayOfBirth}`, async function() {
          // when
          await component.actions.triggerInputDayValidation.call(component, 'dayOfBirth', wrongDayOfBirth);

          // then
          expect(component.validation.dayOfBirth).to.equal('Votre jour de naissance n’est pas valide.');
        });
      });
    });

    context('when dayOfBirth is valid', function() {

      [
        '1',
        '01',
        '31',
      ].forEach(function(validDayOfBirth) {
        it(`should not display an error when dayOfBirth is ${validDayOfBirth}`, async function() {
          // when
          await component.actions.triggerInputDayValidation.call(component, 'dayOfBirth', validDayOfBirth);

          // then
          expect(component.validation.dayOfBirth).to.equal(null);
        });
      });
    });
  });

  describe('#triggerInputMonthValidation', function() {

    context('when monthOfBirth is invalid', function() {

      [
        '',
        ' ',
        '13',
        '0',
        '444',
        'ee',
      ].forEach(function(wrongMonthOfBirth) {
        it(`should display an error when monthOfBirth is ${wrongMonthOfBirth}`, async function() {
          // when
          await component.actions.triggerInputMonthValidation.call(component, 'monthOfBirth', wrongMonthOfBirth);

          // then
          expect(component.validation.monthOfBirth).to.equal('Votre mois de naissance n’est pas valide.');
        });
      });
    });

    context('when monthOfBirth is valid', function() {

      [
        '1',
        '01',
        '12',
      ].forEach(function(validMonthOfBirth) {
        it(`should not display an error when monthOfBirth is ${validMonthOfBirth}`, async function() {
          // when
          await component.actions.triggerInputMonthValidation.call(component, 'monthOfBirth', validMonthOfBirth);

          // then
          expect(component.validation.monthOfBirth).to.equal(null);
        });
      });
    });
  });

  describe('#triggerInputYearValidation', function() {

    context('when yearOfBirth is invalid', function() {

      [
        '',
        ' ',
        '1',
        '11',
        '100',
        '0000',
        '0001',
        '0011',
        '0111',
        '10000',
      ].forEach(function(wrongYearOfBirth) {
        it(`should display an error when yearOfBirth is ${wrongYearOfBirth}`, async function() {
          // when
          await component.actions.triggerInputYearValidation.call(component, 'yearOfBirth', wrongYearOfBirth);

          // then
          expect(component.validation.yearOfBirth).to.equal('Votre année de naissance n’est pas valide.');
        });
      });
    });

    context('when yearOfBirth is valid', function() {

      [
        '1000',
        '9999',
      ].forEach(function(validYearOfBirth) {
        it(`should not display an error when yearOfBirth is ${validYearOfBirth}`, async function() {
          // when
          await component.actions.triggerInputYearValidation.call(component, 'yearOfBirth', validYearOfBirth);

          // then
          expect(component.validation.yearOfBirth).to.equal(null);
        });
      });
    });
  });

  describe('#triggerInputStringValidation', function() {

    context('when string is invalid', function() {

      [
        '',
        ' ',
      ].forEach(function(wrongString) {
        it(`should display an error when firstName is "${wrongString}"`, async function() {
          // when
          await component.actions.triggerInputStringValidation.call(component, 'firstName', wrongString);

          // then
          expect(component.validation.firstName).to.equal('Votre prénom n’est pas renseigné.');
        });

        it(`should display an error when lastName is "${wrongString}"`, async function() {
          // when
          await component.actions.triggerInputStringValidation.call(component, 'lastName', wrongString);

          // then
          expect(component.validation.lastName).to.equal('Votre nom n’est pas renseigné.');
        });
      });
    });

    context('when string is valid', function() {

      [
        'Robert',
        'Smith',
      ].forEach(function(validString) {
        it(`should not display an error when firstName is ${validString}`, async function() {
          // when
          await component.actions.triggerInputStringValidation.call(component, 'firstName', validString);

          // then
          expect(component.validation.firstName).to.equal(null);
        });

        it(`should not display an error when lastName is ${validString}`, async function() {
          // when
          await component.actions.triggerInputStringValidation.call(component, 'lastName', validString);

          // then
          expect(component.validation.lastName).to.equal(null);
        });
      });
    });
  });

  describe('#isFormNotValid', function() {

    it('should be true if firstName is not valid', function() {
      // given
      component.firstName = ' ';
      component.lastName = 'Smith';
      component.dayOfBirth = '15';
      component.monthOfBirth = '12';
      component.yearOfBirth = '1999';

      // when
      const result = component.isFormNotValid;

      // then
      expect(result).to.equal(true);
    });

    it('should be true if lastName is not valid', function() {
      // given
      component.firstName = 'Robert';
      component.lastName = '';
      component.dayOfBirth = '15';
      component.monthOfBirth = '12';
      component.yearOfBirth = '99999';

      // when
      const result = component.isFormNotValid;

      // then
      expect(result).to.equal(true);
    });

    it('should be true if dayOfBirth is not valid', function() {
      // given
      component.dayOfBirth = '99';
      component.monthOfBirth = '12';
      component.yearOfBirth = '1999';

      // when
      const result = component.isFormNotValid;

      // then
      expect(result).to.equal(true);
    });

    it('should be true if monthOfBirth is not valid', function() {
      // given
      component.dayOfBirth = '15';
      component.monthOfBirth = '99';
      component.yearOfBirth = '1999';

      // when
      const result = component.isFormNotValid;

      // then
      expect(result).to.equal(true);
    });

    it('should be true if yearOfBirth is not valid', function() {
      // given
      component.dayOfBirth = '15';
      component.monthOfBirth = '12';
      component.yearOfBirth = '99999';

      // when
      const result = component.isFormNotValid;

      // then
      expect(result).to.equal(true);
    });

    it('should be false', function() {
      // given
      component.firstName = 'Robert';
      component.lastName = 'Smith';
      component.dayOfBirth = '15';
      component.monthOfBirth = '12';
      component.yearOfBirth = '1999';

      // when
      const result = component.isFormNotValid;

      // then
      expect(result).to.equal(false);
    });
  });

  describe('#isDisabled', function() {

    it('should disable lastName,firstName inputs if external User', function() {
      // given
      const tokenIdExternalUser = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJmaXJzdF9uYW1lIjoiRmlyc3QiLCJsYXN0X25hbWUiOiJMYXN0Iiwic2FtbF9pZCI6InNhbWxJRHFzZnNmcWZxZnNxZmhmZmdyciIsImlhdCI6MTU5NzkyOTQ0OCwiZXhwIjoxNTk3OTMzMDQ4fQ.KRh6ZKr6EwM1QvveTHsWush6z9meVAI6enVYgSQ-MuI';
      sessionStub.data.externalUser = tokenIdExternalUser;

      // when
      const result = component.isDisabled;

      // then
      expect(result).to.equal(true);
    });

    it('should enable lastName,firstName inputs if not external User', function() {
      // when
      const result = component.isDisabled;

      // then
      expect(result).to.equal(false);
    });

  });

  describe('#submit', function() {

    beforeEach(function() {
      component.firstName = 'Robert';
      component.lastName = 'Smith';
      component.dayOfBirth = '10';
      component.monthOfBirth = '10';
      component.yearOfBirth = '2000';
    });

    it('should prevent default handling of event', async function() {
      // given
      // when
      await component.actions.submit.call(component, eventStub);

      // then
      sinon.assert.called(eventStub.preventDefault);
    });

    it('should display an error on firstName', async function() {
      // given
      component.firstName = ' ';

      // when
      await component.actions.submit.call(component, eventStub);

      // then
      sinon.assert.notCalled(onSubmitToReconcileStub);
      expect(component.validation.firstName).to.equal('Votre prénom n’est pas renseigné.');
    });

    it('should display an error on lastName', async function() {
      // given
      component.lastName = '';

      // when
      await component.actions.submit.call(component, eventStub);

      // then
      sinon.assert.notCalled(onSubmitToReconcileStub);
      expect(component.validation.lastName).to.equal('Votre nom n’est pas renseigné.');
    });

    it('should display an error on dayOfBirth', async function() {
      // given
      component.dayOfBirth = '99';

      // when
      await component.actions.submit.call(component, eventStub);

      // then
      sinon.assert.notCalled(onSubmitToReconcileStub);
      expect(component.validation.dayOfBirth).to.equal('Votre jour de naissance n’est pas valide.');
    });

    it('should display an error on monthOfBirth', async function() {
      // given
      component.monthOfBirth = '99';

      // when
      await component.actions.submit.call(component, eventStub);

      // then
      sinon.assert.notCalled(onSubmitToReconcileStub);
      expect(component.validation.monthOfBirth).to.equal('Votre mois de naissance n’est pas valide.');
    });

    it('should display an error on yearOfBirth', async function() {
      // given
      component.yearOfBirth = '99';

      // when
      await component.actions.submit.call(component, eventStub);

      // then
      sinon.assert.notCalled(onSubmitToReconcileStub);
      expect(component.validation.yearOfBirth).to.equal('Votre année de naissance n’est pas valide.');
    });

    context('When user is logged', function() {

      it('should associate user with student and redirect to campaigns.start-or-resume', async function() {
        // given
        const schoolingRegistration = Symbol('registration');
        storeStub.createRecord.withArgs(
          'schooling-registration-user-association',
          {
            id: `${component.args.campaignCode}_${component.lastName}`,
            firstName: component.firstName,
            lastName: component.lastName,
            birthdate: component.birthdate,
            campaignCode: component.args.campaignCode,
          },
        ).returns(schoolingRegistration);

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        sinon.assert.calledWith(onSubmitToReconcileStub, schoolingRegistration);
      });
    });

    context('When user comes from external identity provider', function() {

      it('should call createAndReconcile action', async function() {
        // given
        const externalUserToken = 'external-user-token';
        sessionStub.get.withArgs('data.externalUser').returns(externalUserToken);

        const externalUser = Symbol('external-user');
        storeStub.createRecord.withArgs('external-user', {
          birthdate: component.birthdate,
          campaignCode: component.args.campaignCode,
          externalUserToken,
        }).returns(externalUser);

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        sinon.assert.calledWith(onSubmitToCreateAndReconcileStub, externalUser);
      });
    });

    describe('Errors', function() {
      beforeEach(function() {
        component.firstName = 'pix';
        component.lastName = 'aile';
        component.dayOfBirth = '10';
        component.monthOfBirth = '10';
        component.yearOfBirth = '1010';
      });

      it('should display a not found error', async function() {
        // given
        onSubmitToReconcileStub.rejects({ errors: [{ status: '404' }] });

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        sinon.assert.calledOnce(record.unloadRecord);
        expect(component.errorMessage).to.equal('Vous êtes un élève ? <br/> Vérifiez vos informations (prénom, nom et date de naissance) ou contactez un enseignant.<br/> <br/> Vous êtes un enseignant ? <br/> L‘accès à un parcours n‘est pas disponible pour le moment.');
      });

      describe('When student is already reconciled in others organization', async function() {

        describe('When student account is authenticated by email only', async function() {

          it('should return a conflict error and display the error message related to the short code R11)', async function() {
            // given
            const meta = { shortCode: 'R11', value: 'j***@example.net' };
            const expectedErrorMessage = getJoinErrorsMessageByShortCode(meta);

            const error = {
              status: '409',
              code: 'ACCOUNT_WITH_EMAIL_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
              title: 'Conflict',
              detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
              meta,
            };

            onSubmitToReconcileStub.rejects({ errors: [error] });

            // when
            await component.actions.submit.call(component, eventStub);

            // then
            sinon.assert.calledOnce(record.unloadRecord);
            expect(component.modalErrorMessage).to.equal(expectedErrorMessage);
            expect(component.isLoading).to.be.false;
            expect(component.displayContinueButton).to.be.true;
          });

        });

        describe('When student account is authenticated by username only', async function() {

          it('should return a conflict error and display the error message related to the short code R12)', async function() {
            // given
            const meta = { shortCode: 'R12', value: 'j***.h***2' };
            const expectedErrorMessage = getJoinErrorsMessageByShortCode(meta);

            const error = {
              status: '409',
              code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
              title: 'Conflict',
              detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
              meta,
            };

            onSubmitToReconcileStub.rejects({ errors: [error] });

            // when
            await component.actions.submit.call(component, eventStub);

            // then
            sinon.assert.calledOnce(record.unloadRecord);
            expect(component.modalErrorMessage).to.equal(expectedErrorMessage);
            expect(component.isLoading).to.be.false;
            expect(component.displayContinueButton).to.be.true;
          });

        });

        describe('When student account is authenticated by SamlId only', async function() {

          it('should return a conflict error and display the error message related to the short code R13)', async function() {
            // given
            const meta = { shortCode: 'R13', value: undefined };
            const expectedErrorMessage = getJoinErrorsMessageByShortCode(meta);

            const error = {
              status: '409',
              code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
              title: 'Conflict',
              detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
              meta,
            };

            onSubmitToReconcileStub.rejects({ errors: [error] });

            // when
            await component.actions.submit.call(component, eventStub);

            // then
            sinon.assert.calledOnce(record.unloadRecord);
            expect(component.modalErrorMessage).to.equal(expectedErrorMessage);
            expect(component.isLoading).to.be.false;
            expect(component.displayContinueButton).to.be.false;
          });

        });

        describe('When student account is authenticated by SamlId and username', async function() {

          it('should return a conflict error and display the error message related to the short code R13)', async function() {
            // given
            const meta = { shortCode: 'R13', value: undefined };
            const expectedErrorMessage = getJoinErrorsMessageByShortCode(meta);

            const error = {
              status: '409',
              code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
              title: 'Conflict',
              detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
              meta,
            };

            onSubmitToReconcileStub.rejects({ errors: [error] });

            // when
            await component.actions.submit.call(component, eventStub);

            // then
            sinon.assert.calledOnce(record.unloadRecord);
            expect(component.modalErrorMessage).to.equal(expectedErrorMessage);
            expect(component.isLoading).to.be.false;
            expect(component.displayContinueButton).to.be.false;
          });

        });

        describe('When student account is authenticated by SamlId and email', async function() {

          it('should return a conflict error and display the error message related to the short code R13)', async function() {
            // given
            const meta = { shortCode: 'R13', value: undefined };
            const expectedErrorMessage = getJoinErrorsMessageByShortCode(meta);

            const error = {
              status: '409',
              code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
              title: 'Conflict',
              detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
              meta,
            };

            onSubmitToReconcileStub.rejects({ errors: [error] });

            // when
            await component.actions.submit.call(component, eventStub);

            // then
            sinon.assert.calledOnce(record.unloadRecord);
            expect(component.modalErrorMessage).to.equal(expectedErrorMessage);
            expect(component.isLoading).to.be.false;
            expect(component.displayContinueButton).to.be.false;
          });

        });

        describe('When student account is authenticated by SamlId, username and email', async function() {

          it('should return a conflict error and display the error message related to the short code R13)', async function() {
            // given
            const meta = { shortCode: 'R13', value: undefined };
            const expectedErrorMessage = getJoinErrorsMessageByShortCode(meta);

            const error = {
              status: '409',
              code: 'ACCOUNT_WITH_GAR_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
              title: 'Conflict',
              detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
              meta,
            };

            onSubmitToReconcileStub.rejects({ errors: [error] });

            // when
            await component.actions.submit.call(component, eventStub);

            // then
            sinon.assert.calledOnce(record.unloadRecord);
            expect(component.modalErrorMessage).to.equal(expectedErrorMessage);
            expect(component.isLoading).to.be.false;
            expect(component.displayContinueButton).to.be.false;
          });

        });

        describe('When student account is authenticated by username and email', async function() {

          it('should return a conflict error and display the error message related to the short code R12)', async function() {
            // given
            const meta = { shortCode: 'R12', value: 'j***.h***2' };
            const expectedErrorMessage = getJoinErrorsMessageByShortCode(meta);

            const error = {
              status: '409',
              code: 'ACCOUNT_WITH_USERNAME_ALREADY_EXIST_FOR_ANOTHER_ORGANIZATION',
              title: 'Conflict',
              detail: 'Un compte existe déjà pour l‘élève dans un autre établissement.',
              meta,
            };

            onSubmitToReconcileStub.rejects({ errors: [error] });

            // when
            await component.actions.submit.call(component, eventStub);

            // then
            sinon.assert.calledOnce(record.unloadRecord);
            expect(component.modalErrorMessage).to.equal(expectedErrorMessage);
            expect(component.isLoading).to.be.false;
            expect(component.displayContinueButton).to.be.true;
          });
        });
      });
    });
  });
});
