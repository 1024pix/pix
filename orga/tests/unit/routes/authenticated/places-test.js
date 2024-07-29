import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/places', function (hooks) {
  setupTest(hooks);

  module('model', function () {
    test('that modelFor called authenticated', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/places');

      const modelForStub = sinon.stub(route, 'modelFor');

      modelForStub.resolves();

      // when
      await route.model();

      // then
      assert.ok(modelForStub.calledWithExactly('authenticated'));
    });
  });

  module('beforeModel', function () {
    test('should not redirect to application when user is admin and have placesManagement feature is true', function (assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        prescriber = { placesManagement: true };
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const route = this.owner.lookup('route:authenticated/places');
      sinon.stub(route.router, 'replaceWith');

      const expectedRedirection = 'application';
      // when
      route.beforeModel();

      // then
      assert.notOk(route.router.replaceWith.calledWith(expectedRedirection));
    });

    test('should redirect to application when currentUser is not admin', function (assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
        prescriber = { placesManagement: true };
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const route = this.owner.lookup('route:authenticated/places');
      sinon.stub(route.router, 'replaceWith');

      const expectedRedirection = 'application';
      // when
      route.beforeModel();

      // then
      assert.ok(route.router.replaceWith.calledWith(expectedRedirection));
    });

    test('should redirect to application when currentUser does not have placesManagement', function (assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = true;
        prescriber = { placesManagement: false };
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const route = this.owner.lookup('route:authenticated/places');
      sinon.stub(route.router, 'replaceWith');

      const expectedRedirection = 'application';
      // when
      route.beforeModel();

      // then
      assert.ok(route.router.replaceWith.calledWith(expectedRedirection));
    });
  });
});
