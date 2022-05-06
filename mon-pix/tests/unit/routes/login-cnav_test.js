import { expect } from 'chai';
import { describe, it } from 'mocha';
import sinon from 'sinon';
import { setupTest } from 'ember-mocha';

describe('Unit | Route | login-cnav', function () {
  setupTest();

  context('when cnav user disallow pix to use data', function () {
    it('should redirect to login route if there is an error in transition.to', function () {
      // given
      const route = this.owner.lookup('route:login-cnav');
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
