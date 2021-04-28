import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | terms-of-service-pe', function() {
  setupTest();
  let controller;

  describe('#action submit', function() {

    beforeEach(function() {
      controller = this.owner.lookup('controller:terms-of-service-pe');
      controller.session = {
        authenticate: sinon.stub().resolves(),
      };
    });

    it('it should save the acceptance date of the last terms of service', async function() {
      // when
      controller.isTermsOfServiceValidated = true ;
      controller.showErrorTermsOfServiceNotSelected = false ;
      controller.authenticationKey = 'authenticationKey';
      await controller.send('submit');

      // then
      sinon.assert.calledWith(controller.session.authenticate, 'authenticator:oidc', { authenticationKey: 'authenticationKey' });
      expect(controller.showErrorTermsOfServiceNotSelected).to.be.false;
    });

    it('it should show an error to user to validate terms of service ', async function() {
      // when
      controller.isTermsOfServiceValidated = false ;
      controller.showErrorTermsOfServiceNotSelected = false ;
      await controller.send('submit');

      // then
      expect(controller.showErrorTermsOfServiceNotSelected).to.be.true;
    });
  });
});
