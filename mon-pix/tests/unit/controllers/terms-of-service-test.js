import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | terms-of-service', function() {
  setupTest();
  let controller;

  describe('#action submit', function() {

    beforeEach(function() {
      controller = this.owner.lookup('controller:terms-of-service');
      controller.transitionToRoute = sinon.stub();
      controller.currentUser = { user: { save: sinon.stub().resolves() } };
    });

    it('it should save the acceptance date of the last terms of service', async function() {
      // when
      controller.isTermsOfServiceValidated =  true ;
      controller.showErrorTermsOfServiceNotSelected =  false ;

      await controller.send('submit');

      // then
      sinon.assert.calledWith(controller.currentUser.user.save, { adapterOptions: { acceptPixTermsOfService: true } });
      sinon.assert.calledWith(controller.transitionToRoute, 'profile');
      expect(controller.showErrorTermsOfServiceNotSelected).to.be.false;

    });

    it('it should show an error to user to validate terms of service ', async function() {
      // when
      controller.isTermsOfServiceValidated =  false ;
      controller.showErrorTermsOfServiceNotSelected =  false ;
      await controller.send('submit');

      // then
      expect(controller.showErrorTermsOfServiceNotSelected).to.be.true;

    });

  });
});
