import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | modules | passage', function (hooks) {
  setupTest(hooks);

  test('should exist', function (assert) {
    // when
    const route = this.owner.lookup('route:module.passage');

    // then
    assert.ok(route);
  });

  test('should find the corresponding module', async function (assert) {
    // given
    const route = this.owner.lookup('route:module.passage');
    const store = this.owner.lookup('service:store');
    const module = Symbol('the module');
    route.modelFor = sinon.stub();
    route.modelFor.withArgs('module').returns(module);

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

    const route = this.owner.lookup('route:module.passage');
    const store = this.owner.lookup('service:store');
    const module = { id: 'my-module' };

    route.modelFor = sinon.stub();
    route.modelFor.withArgs('module').returns(module);
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
