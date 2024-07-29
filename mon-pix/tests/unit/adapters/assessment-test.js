import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

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
      assert.true(url.endsWith('/assessments/123'));
    });

    test('should redirect to complete-assessment', async function (assert) {
      // given
      const options = { adapterOptions: { completeAssessment: true } };

      // when
      const url = await adapter.urlForUpdateRecord(123, 'assessment', options);

      // then
      assert.true(url.endsWith('/assessments/123/complete-assessment'));
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
      assert.true(url.endsWith('/assessments/123/last-challenge-state/timeout'));
    });
  });

  module('#createLiveAlert', function () {
    test('should post the correct payload to the correctly built create live alert url', async function (assert) {
      // given
      adapter.ajax = sinon.stub();
      const assessmentId = 123;
      const challengeId = 456;
      const payload = { data: { data: { attributes: { 'challenge-id': challengeId } } } };

      // when
      await adapter.createLiveAlert(assessmentId, challengeId);

      // then
      assert.ok(
        adapter.ajax.calledWith(`http://localhost:3000/api/assessments/${assessmentId}/alert`, 'POST', payload),
      );
    });
  });
});
