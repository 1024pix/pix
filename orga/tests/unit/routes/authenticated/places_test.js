import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

import sinon from 'sinon';

module('Unit | Route | authenticated/places', function (hooks) {
  setupTest(hooks);

  module('model', function () {
    test('should redirect to application when error thrown', async function (assert) {
      // given
      const organizationId = Symbol('organizationId');
      const expectedRedirection = 'application';
      class CurrentUserStub extends Service {
        shouldAccessPlacesPage = true;
        organization = {
          id: organizationId,
        };
      }

      const route = this.owner.lookup('route:authenticated/places');
      const queryRecordStub = sinon.stub(route.store, 'queryRecord');

      this.owner.register('service:current-user', CurrentUserStub);
      const replaceWithStub = sinon.stub(route.router, 'replaceWith');

      queryRecordStub.rejects();
      replaceWithStub.resolves();

      // when
      await route.model();

      // then
      sinon.assert.calledWithExactly(queryRecordStub, 'organization-place-statistic', { organizationId });
      sinon.assert.calledWithExactly(replaceWithStub, expectedRedirection);

      assert.ok(true);
    });
  });

  module('beforeModel', function () {
    test('should not redirect to application when currentUser.shouldAccessPlacesPage is true', function (assert) {
      // given
      class CurrentUserStub extends Service {
        shouldAccessPlacesPage = true;
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

    test('should redirect to application when currentUser.shouldAccessPlacesPage is false', function (assert) {
      // given
      class CurrentUserStub extends Service {
        shouldAccessPlacesPage = false;
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
