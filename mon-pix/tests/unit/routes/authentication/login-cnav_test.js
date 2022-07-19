import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | login-cnav', function () {
  setupTest();

  describe('#afterModel', function () {
    describe('when user has no pix account', function () {
      it("should redirect to cgu's cnav page", async function () {
        // given
        const route = this.owner.lookup('route:login-cnav');
        route.router = { replaceWith: sinon.stub() };

        // when
        await route.afterModel({ authenticationKey: '123', shouldValidateCgu: true });

        // then
        sinon.assert.calledWith(route.router.replaceWith, 'terms-of-service-oidc', {
          queryParams: { authenticationKey: '123', identityProviderName: 'cnav' },
        });
      });
    });

    describe('when user has a pix account', function () {
      it("should not redirect to cgu's cnav page", async function () {
        // given
        const route = this.owner.lookup('route:login-cnav');
        route.router = { replaceWith: sinon.stub() };

        // when
        await route.afterModel({ authenticationKey: null, shouldValidateCgu: false });

        // then
        sinon.assert.notCalled(route.router.replaceWith);
      });
    });
  });
});
