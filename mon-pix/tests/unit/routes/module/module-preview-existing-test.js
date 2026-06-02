import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | module | module preview existing', function (hooks) {
  setupTest(hooks);

  test('should exist', function (assert) {
    // when
    const route = this.owner.lookup('route:module-preview-existing');

    // then
    assert.ok(route);
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

      const route = this.owner.lookup('route:module-preview-existing');

      // when
      route.redirect(model);

      // then
      sinon.assert.calledOnceWithExactly(transitionToStub, 'module-preview-existing', model.shortId, model.slug);
      assert.ok(true);
    });
  });
});
