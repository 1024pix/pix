import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | modules | details', function (hooks) {
  setupTest(hooks);

  test('should exist', function (assert) {
    // when
    const route = this.owner.lookup('route:module.details');

    // then
    assert.ok(route);
  });

  test('should call the parent model', async function (assert) {
    // given
    const route = this.owner.lookup('route:module.details');
    const module = Symbol('the-module');
    route.modelFor = sinon.stub();
    route.modelFor.withArgs('module').returns(module);

    // when
    const model = await route.model();

    // then
    assert.strictEqual(model, module);
  });

  module('#redirect', function () {
    test('should call transitionTo function with the right arguments', async function (assert) {
      // given
      const model = {
        shortId: 'shortId',
        slug: 'slug',
      };
      const router = this.owner.lookup('service:router');
      const transitionToStub = sinon.stub(router, 'transitionTo');

      const route = this.owner.lookup('route:module.details');

      // when
      route.redirect(model);

      // then
      sinon.assert.calledOnceWithExactly(transitionToStub, 'module.details', model.shortId, model.slug);
      assert.ok(true);
    });
  });
});
