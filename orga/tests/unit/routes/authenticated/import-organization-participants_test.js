import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';

import sinon from 'sinon';

module('Unit | Route | authenticated/import-organization-participant', function (hooks) {
  setupTest(hooks);

  module('beforeModel', function () {
    test('should redirect to application when shouldAccessImportPage is false', function (assert) {
      // given
      class CurrentUserStub extends Service {
        shouldAccessImportPage = false;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const route = this.owner.lookup('route:authenticated.import-organization-participants');
      const replaceWithStub = sinon.stub();
      route.router.replaceWith = replaceWithStub;

      // when
      route.beforeModel();

      // then
      sinon.assert.calledOnceWithExactly(replaceWithStub, 'application');
      assert.ok(true);
    });

    test('should not redirect to application when currentUser.isAdminInOrganization and currentUser.isSCOManagingStudents are true', function (assert) {
      // given
      class CurrentUserStub extends Service {
        shouldAccessImportPage = true;
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const route = this.owner.lookup('route:authenticated.import-organization-participants');
      const replaceWithStub = sinon.stub();
      route.replaceWith = replaceWithStub;

      // when
      route.beforeModel();

      // then
      sinon.assert.notCalled(replaceWithStub);
      assert.ok(true);
    });
  });

  module('resetController', function () {
    test('should reset errors and warnings to null when isExiting true', function (assert) {
      const route = this.owner.lookup('route:authenticated.import-organization-participants');

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
      class CurrentUserStub extends Service {
        organization = {
          hasMany: sinon.stub(),
        };
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const route = this.owner.lookup('route:authenticated.import-organization-participants');

      route.currentUser.organization.hasMany.withArgs('divisions').returns({ reload: reloadDivisionStub });

      route.refreshDivisions();
      assert.true(reloadDivisionStub.calledOnce);
    });
  });
  module('refreshGroups', function () {
    test('should reload group relation on organization', function (assert) {
      const reloadGroupStub = sinon.stub();
      class CurrentUserStub extends Service {
        organization = {
          hasMany: sinon.stub(),
        };
      }

      this.owner.register('service:current-user', CurrentUserStub);
      const route = this.owner.lookup('route:authenticated.import-organization-participants');

      route.currentUser.organization.hasMany.withArgs('groups').returns({ reload: reloadGroupStub });

      route.refreshGroups();
      assert.true(reloadGroupStub.calledOnce);
    });
  });
});
