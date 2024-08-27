import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | certification-candidate', function (hooks) {
  setupTest(hooks);

  let adapter;
  const certificationCandidateId = 1;
  const sessionId = 2;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:certification-candidate');
    adapter.ajax = sinon.stub();
  });

  module('#urlForQuery', function () {
    test('should build url from sessionId', async function (assert) {
      // when
      const sessionId = 1;
      const query = { sessionId };
      const url = await adapter.urlForQuery(query);

      // then
      assert.true(url.endsWith(`/sessions/${sessionId}/certification-candidates`));
    });
  });

  module('#urlForCreateRecord', function () {
    test('should build create url from certification-candidate id', async function (assert) {
      // when
      const options = { adapterOptions: {} };
      const url = await adapter.urlForCreateRecord('certification-candidate', options);

      // then
      assert.true(url.endsWith('/certification-candidates'));
    });

    test('should build create url when registerToSession is true', async function (assert) {
      // when
      const options = { adapterOptions: { registerToSession: true, sessionId } };
      const url = await adapter.urlForCreateRecord('certification-candidate', options);

      // then
      assert.true(url.endsWith(`/sessions/${sessionId}/certification-candidates`));
    });
  });

  module('#urlForDeleteRecord', function () {
    test('should build delete url from certification-candidate id', async function (assert) {
      // when
      const options = { adapterOptions: {} };
      const url = await adapter.urlForDeleteRecord(certificationCandidateId, 'certification-candidate', options);

      // then
      assert.true(url.endsWith(`/certification-candidates/${certificationCandidateId}`));
    });

    test('should build delete url when sessionId passed in adapterOptions', async function (assert) {
      // when
      const options = { adapterOptions: { sessionId } };
      const url = await adapter.urlForDeleteRecord(certificationCandidateId, 'certification-candidate', options);

      // then
      assert.true(url.endsWith(`/sessions/${sessionId}/certification-candidates/${certificationCandidateId}`));
    });
  });

  module('#updateRecord', function () {
    test('should build create url from certification-candidate id', async function (assert) {
      // given
      const candidate = { id: 1, accessibilityAdjustmentNeeded: true };
      const sessionId = 2;
      const payload = {
        data: {
          attributes: {
            'accessibility-adjustment-needed': candidate.accessibilityAdjustmentNeeded,
          },
        },
      };

      // when
      await adapter.updateRecord({ candidate, sessionId });

      // then
      const expectedUrl = 'http://localhost:3000/api/sessions/2/certification-candidates/1';

      sinon.assert.calledWithExactly(adapter.ajax, expectedUrl, 'PATCH', { data: payload });
      assert.ok(true);
    });
  });
});
