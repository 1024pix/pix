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

    context('when user info are typed', function() {
      beforeEach(function() {
        component.studentNumber = '123456';
        component.firstName = 'firstName';
        component.lastName = 'lastName';
        component.dayOfBirth = '01';
        component.monthOfBirth = '01';
        component.yearOfBirth = '2010';
      });

      it('call on submit function', async function() {
        // given
        const adapterOptions = { registerAdditional: true };
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
        component.showFurtherInformationForm = true;

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        sinon.assert.calledWith(onSubmitToReconcileStub, schoolingRegistration, adapterOptions);
      });
    });

    context('when student number is not typed but others attributes are', function() {
      beforeEach(function() {
        component.noStudentNumber = true;
        component.studentNumber = null;
        component.firstName = 'firstName';
        component.lastName = 'lastName';
        component.dayOfBirth = '01';
        component.monthOfBirth = '01';
        component.yearOfBirth = '2010';
      });

      it('call on submit function', async function() {
        // given
        const adapterOptions = { registerAdditional: true };
        const schoolingRegistration = Symbol('registration');
        storeStub.createRecord.withArgs(
          'schooling-registration-user-association',
          {
            id: `${component.args.campaignCode}_${component.lastName}`,
            studentNumber: null,
            firstName: component.firstName,
            lastName: component.lastName,
            birthdate: component.birthdate,
            campaignCode: component.args.campaignCode,
          },
        ).returns(schoolingRegistration);

        component.showFurtherInformationForm = true;

        // when
        await component.actions.submit.call(component, eventStub);

        // then
        sinon.assert.calledWith(onSubmitToReconcileStub, schoolingRegistration, adapterOptions);
      });
    });

    it('should display an error when student number is not correct', async function() {
      // given
      component.studentNumber = '';

      // when
      await component.actions.submit.call(component, eventStub);

      // then
      sinon.assert.notCalled(onSubmitToReconcileStub);
      expect(component.validation.studentNumber).to.equal('Votre numéro étudiant n’est pas renseigné.');
    });

    it('should prevent default handling of event', async function() {
      // when
      await component.actions.submit.call(component, eventStub);

      // then
      sinon.assert.called(eventStub.preventDefault);
    });
  });
});
