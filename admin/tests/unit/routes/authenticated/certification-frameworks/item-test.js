import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | authenticated/certification-frameworks/item', function (hooks) {
  setupTest(hooks);

  let route;
  let store;

  hooks.beforeEach(function () {
    route = this.owner.lookup('route:authenticated/certification-frameworks/item');
    store = this.owner.lookup('service:store');
    store.peekAll = sinon.stub();
    store.findAll = sinon.stub();
    store.queryRecord = sinon.stub();
  });

  module('model()', function () {
    module('when the framework is CLEA', function () {
      test('it should load complementary-certification and set hasTargetProfilesHistory to true', async function (assert) {
        // given
        const cleaFramework = { name: 'CLEA' };
        const cleaComplementary = { key: 'CLEA' };
        store.peekAll.withArgs('certification-framework').returns([cleaFramework]);
        store.peekAll.withArgs('complementary-certification').returns([cleaComplementary]);
        store.findAll.withArgs('complementary-certification').resolves([cleaComplementary]);
        store.queryRecord.withArgs('framework-history').resolves(null);

        // when
        const result = await route.model({ certification_framework_key: 'CLEA' });

        // then
        assert.ok(store.findAll.calledWith('complementary-certification'));
        assert.strictEqual(result.currentComplementaryCertification, cleaComplementary);
        assert.true(result.hasTargetProfilesHistory);
      });
    });

    module('when the framework is CORE', function () {
      test('it should not load complementary-certification and set hasTargetProfilesHistory to false', async function (assert) {
        // given
        const coreFramework = { name: 'CORE' };
        store.peekAll.withArgs('certification-framework').returns([coreFramework]);

        // when
        const result = await route.model({ certification_framework_key: 'CORE' });

        // then
        assert.notOk(store.findAll.called);
        assert.strictEqual(result.currentComplementaryCertification, undefined);
        assert.false(result.hasTargetProfilesHistory);
      });
    });

    module('when the framework is neither CORE nor CLEA', function () {
      test('it should not load complementary-certification and set hasTargetProfilesHistory to true', async function (assert) {
        // given
        const droitFramework = { name: 'DROIT' };
        store.peekAll.withArgs('certification-framework').returns([droitFramework]);

        // when
        const result = await route.model({ certification_framework_key: 'DROIT' });

        // then
        assert.notOk(store.findAll.called);
        assert.strictEqual(result.currentComplementaryCertification, undefined);
        assert.true(result.hasTargetProfilesHistory);
      });
    });
  });
});
