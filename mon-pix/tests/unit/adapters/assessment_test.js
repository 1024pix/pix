import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Adapters | assessment', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:assessment');
  });

  module('#urlForUpdateRecord', function () {
    test('should build update url from assessment id', async function (assert) {
      // given
      const options = { adapterOptions: {} };

      // when
      const url = await adapter.urlForUpdateRecord(123, 'assessment', options);

      // then
      assert.equal(url.endsWith('/assessments/123'), true);
    });

    test('should redirect to complete-assessment', async function (assert) {
      // given
      const options = { adapterOptions: { completeAssessment: true } };

      // when
      const url = await adapter.urlForUpdateRecord(123, 'assessment', options);

      // then
      assert.equal(url.endsWith('/assessments/123/complete-assessment'), true);
    });

    test('should redirect to update last-question-state', async function (assert) {
      // given
      const attrStub = (name) => (name === 'lastQuestionState' ? 'timeout' : null);
      const snapshot = {
        adapterOptions: { updateLastQuestionState: true },
        attr: attrStub,
      };

      // when
      const url = await adapter.urlForUpdateRecord(123, 'assessment', snapshot);

      // then
      assert.equal(url.endsWith('/assessments/123/last-challenge-state/timeout'), true);
    });
  });
});
