import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { resolve } from 'rsvp';

module('Unit | Adapters | certification-candidate', function(hooks) {
  setupTest(hooks);

  let adapter;
  const certificationCandidateId = 1;
  const sessionId = 2;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:certification-candidate');
    const ajaxStub = () => resolve();
    adapter.ajax = ajaxStub;
  });

  module('#urlForCreateRecord', function() {

    test('should build create url from certification-candidate id', async function(assert) {
      // when
      const options = { adapterOptions: { } };
      const url = await adapter.urlForCreateRecord('certification-candidate', options);

      // then
      assert.equal(url.endsWith('/certification-candidates'), true);
    });

    test('should build create url when registerToSession is true', async function(assert) {
      // when
      const options = { adapterOptions: { registerToSession: true, sessionId } };
      const url = await adapter.urlForCreateRecord('certification-candidate', options);

      // then
      assert.equal(url.endsWith(`/sessions/${sessionId}/certification-candidates`), true);
    });

  });

  module('#urlForDeleteRecord', function() {

    test('should build delete url from certification-candidate id', async function(assert) {
      // when
      const options = { adapterOptions: { } };
      const url = await adapter.urlForDeleteRecord(certificationCandidateId, 'certification-candidate', options);

      // then
      assert.equal(url.endsWith(`/certification-candidates/${certificationCandidateId}`), true);
    });

    test('should build delete url when sessionId passed in adapterOptions', async function(assert) {
      // when
      const options = { adapterOptions: { sessionId } };
      const url = await adapter.urlForDeleteRecord(certificationCandidateId, 'certification-candidate', options);

      // then
      assert.equal(url.endsWith(`/sessions/${sessionId}/certification-candidates/${certificationCandidateId}`), true);
    });

  });

});
