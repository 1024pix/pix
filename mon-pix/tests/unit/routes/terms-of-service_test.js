import { describe, it, beforeEach } from 'mocha';
import { setupTest } from 'ember-mocha';
import sinon from 'sinon';

describe('Unit | Route | Terms-of-service', function () {
  setupTest();

  let route;

  beforeEach(function () {
    route = this.owner.lookup('route:terms-of-service');
    route.replaceWith = sinon.stub();
    route.currentUser = { user: { mustValidateTermsOfService: true } };
    route.session = { attemptedTransition: null, data: {} };
  });

  describe('#beforeModel', function () {
    context('when user is external', function () {
      beforeEach(function () {
        route.session.data.externalUser = 'some external user';
      });

      it('should redirect to default page if there is no attempted transition', async function () {
        // when
        await route.beforeModel();

        // then
        sinon.assert.calledWith(route.replaceWith, '');
      });

      it('should redirect to attempted transition if there is one', async function () {
        // given
        route.session.attemptedTransition = { retry: sinon.stub() };
        // when
        await route.beforeModel();

        // then
        sinon.assert.called(route.session.attemptedTransition.retry);
      });
    });

    context('when user must not validate terms of service', function () {
      beforeEach(function () {
        route.currentUser.user.mustValidateTermsOfService = false;
      });

      it('should transition to default page if there is no attempted transition', async function () {
        // when
        await route.beforeModel();

        // then
        sinon.assert.calledWith(route.replaceWith, '');
      });

      it('should redirect to attempted transition if there is one', async function () {
        // given
        route.session.attemptedTransition = { retry: sinon.stub() };
        // when
        await route.beforeModel();

        // then
        sinon.assert.called(route.session.attemptedTransition.retry);
      });
    });
  });
});
