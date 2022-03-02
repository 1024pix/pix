import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | login-pe', function () {
  setupTest();

  let route;
  const loginTransition = Symbol('login transition');

  beforeEach(function () {
    route = this.owner.lookup('route:login-pe');
    sinon.stub(route, 'replaceWith');
    route.replaceWith.withArgs('login').returns(loginTransition);
  });

  context('when pole-emploi user disallow PIX to use data', function () {
    const queryParams = {
      error: 'access_denied',
    };

    it('should redirect to login route if there is an error in transition.to', function () {
      // given
      const transition = {
        to: {
          queryParams,
        },
      };

      // when
      const transitionResult = route.beforeModel(transition);

      // then
      expect(transitionResult).to.equal(loginTransition);
    });

    it('should redirect to login route if there is an error in transition', function () {
      // given
      const transition = {
        queryParams,
      };

      // when
      const transitionResult = route.beforeModel(transition);

      // then
      expect(transitionResult).to.equal(loginTransition);
    });
  });
});
