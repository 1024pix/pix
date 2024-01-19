import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import sinon from 'sinon';

module('Unit | Route | modules | get', function (hooks) {
  setupTest(hooks);

  test('should exist', function (assert) {
    // when
    const route = this.owner.lookup('route:module/get');

    // then
    assert.ok(route);
  });

  test('should find the corresponding module', async function (assert) {
    // given
    const route = this.owner.lookup('route:module/get');
    const store = this.owner.lookup('service:store');

    const module = Symbol('the module');

    store.findRecord = sinon.stub();
    store.findRecord.withArgs('module', 'the-module').resolves(module);
    store.createRecord = sinon.stub();
    store.createRecord.returns({ save: () => {} });

    // when
    const model = await route.model({ slug: 'the-module' });

    // then
    assert.strictEqual(model.module, module);
  });

  test('should create and return a new passage', async function (assert) {
    // given
    const passage = Symbol('passage');

    const route = this.owner.lookup('route:module/get');
    const store = this.owner.lookup('service:store');

    store.findRecord = sinon.stub();
    store.createRecord = sinon.stub();
    const save = sinon.stub();
    save.resolves(passage);

    store.createRecord.withArgs('passage', { moduleId: 'my-module' }).returns({ save: save });

    // when
    const model = await route.model({ slug: 'my-module' });

    // then
    assert.strictEqual(model.passage, passage);
  });
});
