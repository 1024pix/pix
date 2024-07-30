import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/import-organization-participants', function (hooks) {
  setupTest(hooks);
  let route;
  let store;
  let replaceWithStub;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/import-organization-participants');
    store = this.owner.lookup('service:store');
    replaceWithStub = sinon.stub(route.router, 'replaceWith');
    sinon.stub(store, 'queryRecord');
    route.currentUser = { canAccessImportPage: true, organization: { id: Symbol('organization-id') } };
  });

  test('should return organization-import-detail', async function (assert) {
    // given
    store.queryRecord.resolves();

    // when
    await route.model();

    // then
    assert.ok(
      store.queryRecord.calledOnceWithExactly('organization-import-detail', {
        organizationId: route.currentUser.organization.id,
      }),
    );
  });

  module('beforeModel', function () {
    test('should redirect to application when canAccessImportPage is false', function (assert) {
      // given
      route.currentUser.canAccessImportPage = false;

      // when
      route.beforeModel();

      // then
      assert.ok(replaceWithStub.calledOnceWithExactly('application'));
    });

    test('should not redirect to application when currentUser.isAdminInOrganization and currentUser.isSCOManagingStudents are true', function (assert) {
      // given
      route.currentUser.canAccessImportPage = true;

      // when
      route.beforeModel();

      // then
      assert.ok(replaceWithStub.notCalled);
    });
  });

  module('resetController', function () {
    test('should reset errors and warnings to null when isExiting true', function (assert) {
      const controller = { set: sinon.stub() };
      route.resetController(controller, true);
      assert.true(controller.set.calledWithExactly('errors', null));
      assert.true(controller.set.calledWithExactly('warnings', null));
      assert.true(controller.set.calledWithExactly('warningBanner', null));
    });
  });
  module('refreshDivisions', function () {
    test('should reload division relation on organization', function (assert) {
      const reloadDivisionStub = sinon.stub();
      route.currentUser.organization = {
        hasMany: sinon.stub(),
      };

      route.currentUser.organization.hasMany.withArgs('divisions').returns({ reload: reloadDivisionStub });

      route.refreshDivisions();
      assert.true(reloadDivisionStub.calledOnce);
    });
  });
  module('refreshGroups', function () {
    test('should reload group relation on organization', function (assert) {
      const reloadGroupStub = sinon.stub();
      route.currentUser.organization = {
        hasMany: sinon.stub(),
      };

      route.currentUser.organization.hasMany.withArgs('groups').returns({ reload: reloadGroupStub });

      route.refreshGroups();
      assert.true(reloadGroupStub.calledOnce);
    });
  });
});
