import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';
import Service from '@ember/service';

module('Unit | Route | authenticated/autonomous-courses/list', function (hooks) {
  setupTest(hooks);

  let route;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/autonomous-courses/list');
  });

  module('#beforeModel', function () {
    test('it should check if current user is "SUPER_ADMIN", "METIER" or "SUPPORT"', function (assert) {
      // given
      const restrictAccessToStub = sinon.stub().returns();
      class AccessControlStub extends Service {
        restrictAccessTo = restrictAccessToStub;
      }
      this.owner.register('service:access-control', AccessControlStub);

      // when
      route.beforeModel();

      // then
      assert.ok(restrictAccessToStub.calledWith(['isSuperAdmin', 'isSupport', 'isMetier'], 'authenticated'));
    });
  });

  module('#model', function () {
    test('it should call store.query with expected page arguments', async function (assert) {
      // given
      route.store.query = sinon.stub().resolves();

      const params = {
        pageNumber: 'somePageNumber',
        pageSize: 'somePageSize',
      };

      const expectedQueryArgs = {
        page: {
          number: 'somePageNumber',
          size: 'somePageSize',
        },
      };

      // when
      await route.model(params);

      // then
      sinon.assert.calledWith(route.store.query, 'autonomous-course', expectedQueryArgs);
      assert.ok(true);
    });
  });
});
