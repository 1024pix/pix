import { expect } from 'chai';
import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | login-pole-emploi', function () {
  setupTest();

  context('when pole-emploi user disallow PIX to use data', function () {
    it('should redirect to login route if there is an error in transition.to', function () {
      // given
      const route = this.owner.lookup('route:login-pole-emploi');
      const loginTransition = Symbol('login transition');
      sinon.stub(route, 'replaceWith').withArgs('login').returns(loginTransition);

      // when
      const transitionResult = route.beforeModel({
        to: {
          queryParams: {
            error: 'access_denied',
          },
        },
      });

      // then
      expect(transitionResult).to.equal(loginTransition);
    });
  });
});
