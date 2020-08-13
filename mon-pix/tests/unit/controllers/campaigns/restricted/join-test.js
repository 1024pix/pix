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
  });
});
