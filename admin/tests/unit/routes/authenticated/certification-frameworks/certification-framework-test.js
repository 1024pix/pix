import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/certification-frameworks/certification-framework', function (hooks) {
  setupTest(hooks);

  let route;
  let store;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/certification-frameworks/certification-framework');
    store = this.owner.lookup('service:store');
    store.peekAll = sinon.stub();
    store.queryRecord = sinon.stub();
  });

  module('model()', function () {
    module('when the framework is CORE', function () {
      test('it should set hasTargetProfilesHistory to false', async function (assert) {
        // given
        const coreFramework = { name: 'CORE' };
        store.peekAll.withArgs('certification-framework').returns([coreFramework]);

        // when
        const result = await route.model({ certification_framework_key: 'CORE' });

        // then
        assert.false(result.hasTargetProfilesHistory);
      });
    });

    module('when the framework is not CORE', function () {
      test('it should set hasTargetProfilesHistory to true', async function (assert) {
        // given
        const droitFramework = { name: 'DROIT' };
        store.peekAll.withArgs('certification-framework').returns([droitFramework]);

        // when
        const result = await route.model({ certification_framework_key: 'DROIT' });

        // then
        assert.true(result.hasTargetProfilesHistory);
      });
    });
  });
});
