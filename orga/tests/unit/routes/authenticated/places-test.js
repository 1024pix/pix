import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/places', function (hooks) {
  setupTest(hooks);

  module('model', function () {
    test('fetch both places lots and statistics', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated/places');
      const store = this.owner.lookup('service:store');

      const organizationId = Symbol('organization-id');
      const statistics = Symbol('statistics');
      const placesLots = Symbol('placesLots');

      route.currentUser = { organization: { id: organizationId } };

      const modelForStub = sinon.stub(route, 'modelFor');
      const query = sinon.stub(store, 'query');

      modelForStub.withArgs('authenticated').resolves(statistics);
      query
        .withArgs('organization-places-lot', {
          filter: { organizationId },
        })
        .resolves(placesLots);

      // when
      const result = await route.model();

      // then
      assert.deepEqual(result, { statistics, placesLots });
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
