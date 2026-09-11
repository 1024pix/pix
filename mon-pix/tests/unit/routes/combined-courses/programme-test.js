import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Route | combined-courses | presentation', function (hooks) {
  setupTest(hooks);

  test('activate should set metrics context', function (assert) {
    // Given
    const route = this.owner.lookup('route:combined-courses/presentation');
    route.metrics = { context: {} };
    const paramsForStub = sinon.stub(route, 'paramsFor').returns({ code: 'COMBINIX' });

    // When
    route.activate();

    // Then
    assert.deepEqual(route.metrics.context.code, 'COMBINIX');
    assert.strictEqual(route.metrics.context.type, 'combined-course');
    assert.ok(paramsForStub.calledWith('combined-courses.programme'));
  });

  test('deactivate should unset metrics context', function (assert) {
    // Given
    const route = this.owner.lookup('route:combined-courses/presentation');
    route.metrics = {
      context: {
        code: 'COMBINIX',
        type: 'combined-course',
      },
    };

    // When
    route.deactivate();

    // Then
    assert.strictEqual(route.metrics.context.code, undefined);
    assert.strictEqual(route.metrics.context.type, undefined);
  });
});
