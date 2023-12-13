import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

import sinon from 'sinon';

module('Unit | Route | authenticated/places', function (hooks) {
  setupTest(hooks);

  module('beforeModel', function () {
    test('should not redirect to application when currentUser.isAdminInOrganization && placesManagement feature are true', function (assert) {
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

    test('should redirect to application when currentUser.isAdminInOrganization && placesManagement feature are false', function (assert) {
      // given
      class CurrentUserStub extends Service {
        isAdminInOrganization = false;
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

    test('should redirect to application when only currentUser.isAdminInOrganization is true', function (assert) {
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

    test('should redirect to application when only placesManagement feature is true', function (assert) {
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
  });
});
