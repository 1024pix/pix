import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

import sinon from 'sinon';

module('Unit | Route | authenticated/missions', function (hooks) {
  setupTest(hooks);

  module('beforeModel', function () {
    test('should not redirect to application when currentUser.shouldAccessMissionsPage is true', function (assert) {
      // given
      class CurrentUserStub extends Service {
        shouldAccessMissionsPage = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const route = this.owner.lookup('route:authenticated/missions');
      sinon.stub(route.router, 'replaceWith');

      const expectedRedirection = 'application';
      // when
      route.beforeModel();

      // then
      assert.notOk(route.router.replaceWith.calledWith(expectedRedirection));
    });

    test('should redirect to application when currentUser.shouldAccessMissionsPage is false', function (assert) {
      // given
      class CurrentUserStub extends Service {
        shouldAccessMissionsPage = false;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const route = this.owner.lookup('route:authenticated/missions');
      sinon.stub(route.router, 'replaceWith');

      const expectedRedirection = 'application';
      // when
      route.beforeModel();

      // then
      assert.ok(route.router.replaceWith.calledWith(expectedRedirection));
    });
  });
});
