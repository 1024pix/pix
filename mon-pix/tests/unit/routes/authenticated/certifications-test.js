import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | Authenticated | Certifications V2', function (hooks) {
  setupTest(hooks);

  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/certifications');
    route.router.transitionTo = sinon.stub();
  });

  module('#beforeModel', function () {
    module('when feature toggles are not loaded', function () {
      test('it should redirect to certifications join page', function (assert) {
        // when
        route.beforeModel();

        // then
        assert.true(route.router.transitionTo.calledOnceWithExactly('authenticated.certifications'));
      });
    });

    module('when featureToggle isNewCertificationPageEnabled is false', function () {
      test('it should redirect to certifications join page', function (assert) {
        // given
        const featureToggles = this.owner.lookup('service:featureToggles');
        sinon.stub(featureToggles, 'featureToggles').value({ isNewCertificationPageEnabled: false });

        // when
        route.beforeModel();

        // then
        assert.true(route.router.transitionTo.calledOnceWithExactly('authenticated.certifications'));
      });
    });

    module('when featureToggle isNewCertificationPageEnabled is true', function () {
      test('it should not redirect', function (assert) {
        // given
        const featureToggles = this.owner.lookup('service:featureToggles');
        sinon.stub(featureToggles, 'featureToggles').value({ isNewCertificationPageEnabled: true });

        // when
        route.beforeModel();

        // then
        assert.true(route.router.transitionTo.notCalled);
      });
    });
  });
});
