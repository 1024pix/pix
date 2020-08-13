import { expect } from 'chai';
import { beforeEach, describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';
import createComponent from '../../../../../helpers/create-glimmer-component';

describe('Unit | Component | routes/campaigns/restricted/join-sup', function() {
  setupTest();

  let component;
  let storeStub;
  let onSubmitStub;
  let sessionStub;
  let eventStub;

  beforeEach(function() {
    const createStudentUserAssociationStub = sinon.stub();

    storeStub = { createRecord: createStudentUserAssociationStub };
    sessionStub = { data: { authenticated: { source: 'pix' } } };
    onSubmitStub = sinon.stub();
    eventStub = { preventDefault: sinon.stub() };
    component = createComponent('component:routes/campaigns/restricted/join-sup', { onSubmit: onSubmitStub, campaignCode: 123 });
    component.store = storeStub;
    component.session = sessionStub;
  });

  describe('#attemptNext', function() {

    beforeEach(function() {
      component.studentNumber = '123456';
    });

    it('call on submit function', async function() {
      // given
      const schoolingRegistration = Symbol('registration');
      storeStub.createRecord.withArgs(
        'schooling-registration-user-association',
        {
          id: `${component.args.campaignCode}_${component.studentNumber}`,
          studentNumber: component.studentNumber,
          campaignCode: component.args.campaignCode,
        }
      ).returns(schoolingRegistration);

      // when
      await component.actions.attemptNext.call(component, eventStub);
      // then
      sinon.assert.calledWith(onSubmitStub, schoolingRegistration);
    });

    it('should display an error when student number is not correct', async function() {
      // given
      component.studentNumber = '';

      // when
      await component.actions.attemptNext.call(component, eventStub);

      // then
      sinon.assert.notCalled(onSubmitStub);
      expect(component.validation.studentNumber).to.equal('Votre numéro étudiant n’est pas renseigné.');
    });

    it('should prevent default handling of event', async function() {
      // given
      // when
      await component.actions.attemptNext.call(component, eventStub);

      // then
      sinon.assert.called(eventStub.preventDefault);
    });
  });
});
