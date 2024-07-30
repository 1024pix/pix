import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated', function (hooks) {
  setupTest(hooks);

  module('beforeModel', function () {
    test('should abort transition if user not logged in', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated');
      const transition = { isAborted: true };
      const requireAuthenticationStub = sinon.stub(route.session, 'requireAuthentication');
      const replaceWithStub = sinon.stub(route.router, 'replaceWith');

      // when
      route.beforeModel(transition);

      // then
      assert.ok(requireAuthenticationStub.calledWith(transition, 'login'));
      assert.notOk(replaceWithStub.called);
    });

    test('should redirect towards cgu if not accepted yet', async function (assert) {
      // given
      const organizationId = Symbol('organizationId');

      class CurrentUserStub extends Service {
        prescriber = { placesManagement: true, pixOrgaTermsOfServiceAccepted: false };
        organization = {
          id: organizationId,
        };
      }

      const route = this.owner.lookup('route:authenticated');
      const transition = { isAborted: false };

      sinon.stub(route.session, 'requireAuthentication');

      const replaceWithStub = sinon.stub(route.router, 'replaceWith');

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      route.beforeModel(transition);

      // then
      assert.ok(replaceWithStub.calledWithExactly('terms-of-service'));
    });

    test('should not redirect towards cgu if already accepted yet', async function (assert) {
      // given
      const organizationId = Symbol('organizationId');

      class CurrentUserStub extends Service {
        prescriber = { placesManagement: true, pixOrgaTermsOfServiceAccepted: true };
        organization = {
          id: organizationId,
        };
      }

      const route = this.owner.lookup('route:authenticated');
      const transition = { isAborted: false };

      sinon.stub(route.session, 'requireAuthentication');

      const replaceWithStub = sinon.stub(route.router, 'replaceWith');

      this.owner.register('service:current-user', CurrentUserStub);

      // when
      route.beforeModel(transition);

      // then
      assert.notOk(replaceWithStub.calledWithExactly('terms-of-service'));
    });
  });

  module('model', function () {
    test('should query record organization-place-statistic', async function (assert) {
      // given
      const organizationId = Symbol('organizationId');

      class CurrentUserStub extends Service {
        prescriber = { placesManagement: true };
        organization = {
          id: organizationId,
        };
      }

      const route = this.owner.lookup('route:authenticated');
      const queryRecordStub = sinon.stub(route.store, 'queryRecord');

      this.owner.register('service:current-user', CurrentUserStub);

      queryRecordStub.resolves();

      // when
      await route.model();

      // then
      assert.ok(queryRecordStub.calledWithExactly('organization-place-statistic', { organizationId }));
    });

    test('should not query record organization-place-statistic if user organization does not have placeManagement feature', async function (assert) {
      // given
      const organizationId = Symbol('organizationId');

      class CurrentUserStub extends Service {
        prescriber = { placesManagement: false };
        organization = {
          id: organizationId,
        };
      }

      const route = this.owner.lookup('route:authenticated');
      const queryRecordStub = sinon.stub(route.store, 'queryRecord');

      this.owner.register('service:current-user', CurrentUserStub);

      queryRecordStub.rejects();

      // when
      await route.model();

      // then
      assert.notOk(queryRecordStub.calledWithExactly('organization-place-statistic', { organizationId }));
    });
  });

  module('refreshAuthenticatedModel', function () {
    test('should call refresh', async function (assert) {
      // given
      const route = this.owner.lookup('route:authenticated');
      route.refresh = sinon.stub();

      // when
      route.refreshAuthenticatedModel();

      // then
      assert.ok(route.refresh.called);
    });
  });
});
