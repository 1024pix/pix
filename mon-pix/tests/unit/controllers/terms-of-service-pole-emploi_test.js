import { describe, it, beforeEach } from 'mocha';
import sinon from 'sinon';
import setupIntlRenderingTest from '../../helpers/setup-intl-rendering';

describe('Unit | Controller | terms-of-service-pole-emploi', function () {
  setupIntlRenderingTest();
  let controller;

  describe('#action submit', function () {
    beforeEach(function () {
      controller = this.owner.lookup('controller:terms-of-service-pole-emploi');
      controller.session = {
        authenticate: sinon.stub(),
      };
    });

    it('should save the acceptance date of the last terms of service', async function () {
      // given
      controller.authenticationKey = 'authenticationKey';

      // when
      await controller.send('createSession');

      // then
      sinon.assert.calledWith(controller.session.authenticate, 'authenticator:pole-emploi', {
        authenticationKey: 'authenticationKey',
      });
    });
  });
});
