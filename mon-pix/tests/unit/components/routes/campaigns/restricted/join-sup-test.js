import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import createComponent from '../../../../../helpers/create-glimmer-component';
import setupIntl from '../../../../../helpers/setup-intl';

describe('Unit | Component | routes/campaigns/restricted/join-sup', function() {
  setupTest();
  setupIntl();

  let component;
  let storeStub;
  let onSubmitToReconcileStub;
  let sessionStub;
  let eventStub;

  beforeEach(function() {
    const createSchoolingRegistrationUserAssociationStub = sinon.stub();

    storeStub = { createRecord: createSchoolingRegistrationUserAssociationStub };
    sessionStub = { data: { authenticated: { source: 'pix' } } };
    onSubmitToReconcileStub = sinon.stub();
    eventStub = { preventDefault: sinon.stub() };
    component = createComponent('component:routes/campaigns/restricted/join-sup', { onSubmitToReconcile: onSubmitToReconcileStub, campaignCode: 123 });
    component.store = storeStub;
    component.session = sessionStub;
  });

  describe('#submit', function() {

    context('when form data are correct', () => {
      beforeEach(function() {
        component.studentNumber = 'F001';
        component.firstName = 'firstName';
        component.lastName = 'lastName';
        component.dayOfBirth = '01';
        component.monthOfBirth = '01';
        component.yearOfBirth = '2010';
      });

      it('call reconciliation for the schooling registration', async function() {
        // given
        const schoolingRegistration = Symbol('registration');
        storeStub.createRecord.withArgs(
          'schooling-registration-user-association',
          {
            id: `${component.args.campaignCode}_${component.lastName}`,
            studentNumber: component.studentNumber,
            firstName: component.firstName,
            lastName: component.lastName,
            birthdate: component.birthdate,
            campaignCode: component.args.campaignCode,
          },
        ).returns(schoolingRegistration);

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        sinon.assert.calledWith(onSubmitToReconcileStub, schoolingRegistration, { reconcileSup: true });
      });
    });

    context('when form data have errors', () => {
      it('should display an error when student number is not correct', async function() {
        // given
        component.studentNumber = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        sinon.assert.notCalled(onSubmitToReconcileStub);
        expect(component.errors.studentNumber).to.equal('Votre numéro étudiant n’est pas renseigné.');
      });

      it('should display an error when first name is not correct', async function() {
        // given
        component.firstName = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        sinon.assert.notCalled(onSubmitToReconcileStub);
        expect(component.errors.firstName).to.equal('Votre prénom n’est pas renseigné.');
      });

      it('should display an error when last name is not correct', async function() {
        // given
        component.lastName = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        sinon.assert.notCalled(onSubmitToReconcileStub);
        expect(component.errors.lastName).to.equal('Votre nom n’est pas renseigné.');
      });

      it('should display an error when day of birth is not correct', async function() {
        // given
        component.dayOfBirth = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        sinon.assert.notCalled(onSubmitToReconcileStub);
        expect(component.errors.dayOfBirth).to.equal('Votre jour de naissance n’est pas valide.');
      });

      it('should display an error when month of birth is not correct', async function() {
        // given
        component.monthOfBirth = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        sinon.assert.notCalled(onSubmitToReconcileStub);
        expect(component.errors.monthOfBirth).to.equal('Votre mois de naissance n’est pas valide.');
      });

      it('should display an error when year of birth is not correct', async function() {
        // given
        component.yearOfBirth = '';

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        sinon.assert.notCalled(onSubmitToReconcileStub);
        expect(component.errors.yearOfBirth).to.equal('Votre année de naissance n’est pas valide.');
      });
    });
  });
});
