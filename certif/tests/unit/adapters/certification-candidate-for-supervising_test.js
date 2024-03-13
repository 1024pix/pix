import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { resolve } from 'rsvp';

module('Unit | Adapters | certification-candidate-for-supervising', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:certification-candidate-for-supervising');
    const ajaxStub = () => resolve();
    adapter.ajax = ajaxStub;
  });

  module('#buildUrl', function () {
    module('when request type is updateAuthorizedToStart', function () {
      test('should build url', async function (assert) {
        // when
        const url = await adapter.buildURL(undefined, 2, undefined, 'updateAuthorizedToStart', undefined);

        // then
        assert.true(url.endsWith('certification-candidates/2/authorize-to-start'));
      });
    });

    module('when request type is authorizeToResume', function () {
      test('should build url', async function (assert) {
        // when
        const url = await adapter.buildURL(undefined, 2, undefined, 'authorizeToResume', undefined);

        // then
        assert.true(url.endsWith('certification-candidates/2/authorize-to-resume'));
      });
    });

    module('when request type is endAssessmentBySupervisor', function () {
      test('should build url', async function (assert) {
        // when
        const url = await adapter.buildURL(undefined, 2, undefined, 'endAssessmentBySupervisor', undefined);

        // then
        assert.true(url.endsWith('certification-candidates/2/end-assessment-by-supervisor'));
      });
    });
  });
});
