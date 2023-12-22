import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | Module | CorrectionResponse', function (hooks) {
  setupTest(hooks);

  test('CorrectionResponse model should exist with the right properties', function (assert) {
    // given
    const feedback = 'Good job!';
    const status = 'ok';
    const solution = 'a1b2c3d4-e5f6-7g8h-9i0j-k1l2m3n4o5p6';
    const store = this.owner.lookup('service:store');

    // when
    const correctionResponse = store.createRecord('correction-response', { feedback, status, solution });

    // then
    assert.ok(correctionResponse);
    assert.strictEqual(correctionResponse.feedback, feedback);
    assert.strictEqual(correctionResponse.status, status);
    assert.strictEqual(correctionResponse.solution, solution);
    assert.true(correctionResponse.isOk);
  });
});
