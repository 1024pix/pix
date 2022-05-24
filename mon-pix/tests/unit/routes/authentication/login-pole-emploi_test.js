import { describe, it } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | login-pole-emploi', function () {
  setupTest();

  describe('#afterModel', function () {
    describe('when user has no pix account', function () {
      it("should redirect to cgu's pole emploi page", async function () {
        // given
        const route = this.owner.lookup('route:login-pole-emploi');
        route.replaceWith = sinon.stub();

        // when
        await route.afterModel({ authenticationKey: '123', shouldValidateCgu: true });

        // then
        sinon.assert.calledWith(route.replaceWith, 'terms-of-service-pole-emploi', {
          queryParams: { authenticationKey: '123' },
        });
      });
    });

    describe('when user has a pix account', function () {
      it("should not redirect to cgu's pole emploi page", async function () {
        // given
        const route = this.owner.lookup('route:login-pole-emploi');
        route.replaceWith = sinon.stub();

        // when
        await route.afterModel({ authenticationKey: null, shouldValidateCgu: false });

        // then
        sinon.assert.notCalled(route.replaceWith);
      });
    });
  });
});
