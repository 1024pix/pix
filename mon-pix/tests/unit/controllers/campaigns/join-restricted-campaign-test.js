import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | campaigns/join-restricted-campaign', function() {
  setupTest();

  let controller;
  let storeStub;
  let sessionStub;
  let studentUserAssociation;

  beforeEach(function() {
    controller = this.owner.lookup('controller:campaigns/join-restricted-campaign');
    controller.transitionToRoute = sinon.stub();
    studentUserAssociation = { save: sinon.stub(), unloadRecord: sinon.stub() };
    const createStudentUserAssociationStub = sinon.stub().returns(studentUserAssociation);
    storeStub = { createRecord: createStudentUserAssociationStub };
    sessionStub = { data: { authenticated: { source: 'pix' } } };
    controller.set('store', storeStub);
    controller.set('session', sessionStub);
    controller.set('model', 'AZERTY999');
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
          await controller.actions.triggerInputDayValidation.call(controller, 'dayOfBirth', wrongDayOfBirth);

          // then
          expect(controller.get('validation.dayOfBirth.message')).to.equal('Votre jour de naissance n’est pas valide.');
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
          await controller.actions.triggerInputDayValidation.call(controller, 'dayOfBirth', validDayOfBirth);

          // then
          expect(controller.get('validation.dayOfBirth.message')).to.equal(null);
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
          await controller.actions.triggerInputMonthValidation.call(controller, 'monthOfBirth', wrongMonthOfBirth);

          // then
          expect(controller.get('validation.monthOfBirth.message')).to.equal('Votre mois de naissance n’est pas valide.');
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
          await controller.actions.triggerInputMonthValidation.call(controller, 'monthOfBirth', validMonthOfBirth);

          // then
          expect(controller.get('validation.monthOfBirth.message')).to.equal(null);
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
          await controller.actions.triggerInputYearValidation.call(controller, 'yearOfBirth', wrongYearOfBirth);

          // then
          expect(controller.get('validation.yearOfBirth.message')).to.equal('Votre année de naissance n’est pas valide.');
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
          await controller.actions.triggerInputYearValidation.call(controller, 'yearOfBirth', validYearOfBirth);

          // then
          expect(controller.get('validation.yearOfBirth.message')).to.equal(null);
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
          await controller.actions.triggerInputStringValidation.call(controller, 'firstName', wrongString);

          // then
          expect(controller.get('validation.firstName.message')).to.equal('Votre prénom n’est pas renseigné.');
        });

        it(`should display an error when lastName is "${wrongString}"`, async function() {
          // when
          await controller.actions.triggerInputStringValidation.call(controller, 'lastName', wrongString);

          // then
          expect(controller.get('validation.lastName.message')).to.equal('Votre nom n’est pas renseigné.');
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
          await controller.actions.triggerInputStringValidation.call(controller, 'firstName', validString);

          // then
          expect(controller.get('validation.firstName.message')).to.equal(null);
        });

        it(`should not display an error when lastName is ${validString}`, async function() {
          // when
          await controller.actions.triggerInputStringValidation.call(controller, 'lastName', validString);

          // then
          expect(controller.get('validation.lastName.message')).to.equal(null);
        });
      });
    });
  });

  describe('#isFormNotValid', function() {

    it('should be true if firstName is not valid', function() {
      // given
      controller.set('firstName', ' ');
      controller.set('lastName', 'Smith');
      controller.set('dayOfBirth', '15');
      controller.set('monthOfBirth', '12');
      controller.set('yearOfBirth', '1999');

      // when
      const result = controller.get('isFormNotValid');

      // then
      expect(result).to.equal(true);
    });

    it('should be true if lastName is not valid', function() {
      // given
      controller.set('firstName', 'Robert');
      controller.set('lastName', '');
      controller.set('dayOfBirth', '15');
      controller.set('monthOfBirth', '12');
      controller.set('yearOfBirth', '99999');

      // when
      const result = controller.get('isFormNotValid');

      // then
      expect(result).to.equal(true);
    });

    it('should be true if dayOfBirth is not valid', function() {
      // given
      controller.set('dayOfBirth', '99');
      controller.set('monthOfBirth', '12');
      controller.set('yearOfBirth', '1999');

      // when
      const result = controller.get('isFormNotValid');

      // then
      expect(result).to.equal(true);
    });

    it('should be true if monthOfBirth is not valid', function() {
      // given
      controller.set('dayOfBirth', '15');
      controller.set('monthOfBirth', '99');
      controller.set('yearOfBirth', '1999');

      // when
      const result = controller.get('isFormNotValid');

      // then
      expect(result).to.equal(true);
    });

    it('should be true if yearOfBirth is not valid', function() {
      // given
      controller.set('dayOfBirth', '15');
      controller.set('monthOfBirth', '12');
      controller.set('yearOfBirth', '99999');

      // when
      const result = controller.get('isFormNotValid');

      // then
      expect(result).to.equal(true);
    });

    it('should be false', function() {
      // given
      controller.set('firstName', 'Robert');
      controller.set('lastName', 'Smith');
      controller.set('dayOfBirth', '15');
      controller.set('monthOfBirth', '12');
      controller.set('yearOfBirth', '1999');

      // when
      const result = controller.get('isFormNotValid');

      // then
      expect(result).to.equal(false);
    });
  });

  describe('#isDisabled', function() {

    it('should be false if source is not external', function() {
      // when
      const result = controller.get('isDisabled');

      // then
      expect(result).to.equal(false);
    });

    it('should be true if source is external', function() {
      // given
      sessionStub.data.authenticated.source = 'external';

      // when
      const result = controller.get('isDisabled');

      // then
      expect(result).to.equal(true);
    });
  });

  describe('#attemptNext', function() {

    beforeEach(function() {
      controller.set('firstName', 'Robert');
      controller.set('lastName', 'Smith');
      controller.set('dayOfBirth', '10');
      controller.set('monthOfBirth', '10');
      controller.set('yearOfBirth', '2000');
    });

    it('should display an error on firstName', async function() {
      // given
      controller.set('firstName', ' ');

      // when
      await controller.actions.attemptNext.call(controller);

      // then
      sinon.assert.notCalled(storeStub.createRecord);
      sinon.assert.notCalled(studentUserAssociation.save);
      expect(controller.get('isLoading')).to.equal(false);
      sinon.assert.notCalled(controller.transitionToRoute);
      expect(controller.get('errorMessage')).to.equal(null);
      expect(controller.get('validation.firstName.message')).to.equal('Votre prénom n’est pas renseigné.');
    });

    it('should display an error on lastName', async function() {
      // given
      controller.set('lastName', '');

      // when
      await controller.actions.attemptNext.call(controller);

      // then
      sinon.assert.notCalled(storeStub.createRecord);
      sinon.assert.notCalled(studentUserAssociation.save);
      expect(controller.get('isLoading')).to.equal(false);
      sinon.assert.notCalled(controller.transitionToRoute);
      expect(controller.get('errorMessage')).to.equal(null);
      expect(controller.get('validation.lastName.message')).to.equal('Votre nom n’est pas renseigné.');
    });

    it('should display an error on dayOfBirth', async function() {
      // given
      controller.set('dayOfBirth', '99');

      // when
      await controller.actions.attemptNext.call(controller);

      // then
      sinon.assert.notCalled(storeStub.createRecord);
      sinon.assert.notCalled(studentUserAssociation.save);
      expect(controller.get('isLoading')).to.equal(false);
      sinon.assert.notCalled(controller.transitionToRoute);
      expect(controller.get('errorMessage')).to.equal(null);
      expect(controller.get('validation.dayOfBirth.message')).to.equal('Votre jour de naissance n’est pas valide.');
    });

    it('should display an error on monthOfBirth', async function() {
      // given
      controller.set('monthOfBirth', '99');

      // when
      await controller.actions.attemptNext.call(controller);

      // then
      sinon.assert.notCalled(storeStub.createRecord);
      sinon.assert.notCalled(studentUserAssociation.save);
      expect(controller.get('isLoading')).to.equal(false);
      sinon.assert.notCalled(controller.transitionToRoute);
      expect(controller.get('errorMessage')).to.equal(null);
      expect(controller.get('validation.monthOfBirth.message')).to.equal('Votre mois de naissance n’est pas valide.');
    });

    it('should display an error on yearOfBirth', async function() {
      // given
      controller.set('yearOfBirth', '99');

      // when
      await controller.actions.attemptNext.call(controller);

      // then
      sinon.assert.notCalled(storeStub.createRecord);
      sinon.assert.notCalled(studentUserAssociation.save);
      expect(controller.get('isLoading')).to.equal(false);
      sinon.assert.notCalled(controller.transitionToRoute);
      expect(controller.get('errorMessage')).to.equal(null);
      expect(controller.get('validation.yearOfBirth.message')).to.equal('Votre année de naissance n’est pas valide.');
    });

    it('should display an error on all fields', async function() {
      // given
      controller.set('firstName', '');
      controller.set('lastName', '');
      controller.set('dayOfBirth', '');
      controller.set('monthOfBirth', '');
      controller.set('yearOfBirth', '');

      // when
      await controller.actions.attemptNext.call(controller);

      // then
      sinon.assert.notCalled(storeStub.createRecord);
      sinon.assert.notCalled(studentUserAssociation.save);
      expect(controller.get('isLoading')).to.equal(false);
      sinon.assert.notCalled(controller.transitionToRoute);
      expect(controller.get('errorMessage')).to.equal(null);
      expect(controller.get('validation.firstName.message')).to.equal('Votre prénom n’est pas renseigné.');
      expect(controller.get('validation.lastName.message')).to.equal('Votre nom n’est pas renseigné.');
      expect(controller.get('validation.dayOfBirth.message')).to.equal('Votre jour de naissance n’est pas valide.');
      expect(controller.get('validation.monthOfBirth.message')).to.equal('Votre mois de naissance n’est pas valide.');
      expect(controller.get('validation.yearOfBirth.message')).to.equal('Votre année de naissance n’est pas valide.');
    });

    it('should be valid after an error', async function() {
      // given
      studentUserAssociation.save.resolves();
      controller.set('yearOfBirth', '99');
      await controller.actions.attemptNext.call(controller);

      // when
      controller.set('yearOfBirth', '2000');
      await controller.actions.attemptNext.call(controller);

      // then
      sinon.assert.calledOnce(storeStub.createRecord);
      sinon.assert.calledOnce(studentUserAssociation.save);
      expect(controller.get('isLoading')).to.equal(false);
      sinon.assert.calledWith(controller.transitionToRoute, 'campaigns.start-or-resume');
      expect(controller.get('errorMessage')).to.equal(null);
      expect(controller.get('validation.yearOfBirth.message')).to.equal(null);
    });

    it('should associate user with student and redirect to campaigns.start-or-resume', async function() {
      // given
      studentUserAssociation.save.resolves();

      // when
      await controller.actions.attemptNext.call(controller);

      // then
      sinon.assert.calledOnce(storeStub.createRecord);
      sinon.assert.calledOnce(studentUserAssociation.save);
      expect(controller.get('isLoading')).to.equal(false);
      sinon.assert.calledWith(controller.transitionToRoute, 'campaigns.start-or-resume');
      expect(controller.get('errorMessage')).to.equal(null);
    });

    it('should display a general error', async function() {
      // given
      studentUserAssociation.save.rejects({ errors: [{ status: '404' }] });

      // when
      await controller.actions.attemptNext.call(controller);

      // then
      sinon.assert.calledOnce(studentUserAssociation.unloadRecord);
      expect(controller.get('errorMessage')).to.equal('Vérifiez vos informations afin de continuer ou prévenez l’organisateur de votre parcours.');
      sinon.assert.notCalled(controller.transitionToRoute);
      expect(controller.get('isLoading')).to.equal(false);
    });

    it('should display a conflict error', async function() {
      // given
      studentUserAssociation.save.rejects({ errors: [{ status: '409' }] });

      // when
      await controller.actions.attemptNext.call(controller);

      // then
      sinon.assert.calledOnce(studentUserAssociation.unloadRecord);
      expect(controller.get('errorMessage')).to.equal('Les informations saisies ont déjà été utilisées. Prévenez l’organisateur de votre parcours.');
      sinon.assert.notCalled(controller.transitionToRoute);
      expect(controller.get('isLoading')).to.equal(false);
    });

    it('should associate user with student and redirect to campaigns.start-or-resume after failing', async function() {
      // given
      studentUserAssociation.save
        .onFirstCall().rejects({ errors: [{ status: '404' }] })
        .onSecondCall().resolves();

      // when
      // first
      await controller.actions.attemptNext.call(controller);
      // second
      await controller.actions.attemptNext.call(controller);

      // then
      sinon.assert.calledTwice(storeStub.createRecord);
      sinon.assert.calledTwice(studentUserAssociation.save);
      expect(controller.get('isLoading')).to.equal(false);
      sinon.assert.calledWith(controller.transitionToRoute, 'campaigns.start-or-resume');
      expect(controller.get('errorMessage')).to.equal(null);
    });
  });
});
