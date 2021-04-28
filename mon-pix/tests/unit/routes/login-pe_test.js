import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | login-pe', function() {

  setupTest();

  let route;

  beforeEach(function() {
    route = this.owner.lookup('route:login-pe');
    sinon.stub(route, 'replaceWith');
  });

  context('when pole-emploi user disallow PIX to use data', function() {

    const queryParams = {
      error: 'access_denied',
    };

    it('should redirect to login route if transition.to exist', async function() {
      // given
      const transition = {
        to: {
          queryParams,
        },
      };

      // when
      await route.afterModel(null, transition);

      // then
      sinon.assert.calledWith(route.replaceWith, 'login');
    });

    it('should redirect to login route if transition exist', async function() {
      // given
      const transition = {
        queryParams,
      };

      // when
      await route.afterModel(null, transition);

      // then
      sinon.assert.calledWith(route.replaceWith, 'login');
    });
  });

});
