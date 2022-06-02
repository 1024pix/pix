import { expect } from 'chai';
import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Controller | terms-of-service-cnav', function () {
  setupTest();
  let controller;

  describe('#action submit', function () {
    beforeEach(function () {
      controller = this.owner.lookup('controller:terms-of-service-cnav');
      controller.session = {
        authenticate: sinon.stub(),
      };
    });

    it('it should save the acceptance date of the last terms of service', async function () {
      // when
      controller.isTermsOfServiceValidated = true;
      controller.showErrorTermsOfServiceNotSelected = false;
      controller.authenticationKey = 'authenticationKey';
      await controller.send('submit');

      // then
      sinon.assert.calledWith(controller.session.authenticate, 'authenticator:cnav', {
        authenticationKey: 'authenticationKey',
      });
      expect(controller.showErrorTermsOfServiceNotSelected).to.be.false;
    });

    it('it should show an error to user to validate terms of service ', async function () {
      // when
      controller.isTermsOfServiceValidated = false;
      controller.showErrorTermsOfServiceNotSelected = false;
      await controller.send('submit');

      // then
      expect(controller.showErrorTermsOfServiceNotSelected).to.be.true;
    });

    it('it should show an error expired authentication key', async function () {
      // given
      controller.session.authenticate.rejects();
      controller.isTermsOfServiceValidated = true;
      controller.showErrorTermsOfServiceExpiredAuthenticatedKey = false;

      // when
      await controller.send('submit');

      // then
      expect(controller.showErrorTermsOfServiceExpiredAuthenticatedKey).to.be.true;
    });
  });
});
