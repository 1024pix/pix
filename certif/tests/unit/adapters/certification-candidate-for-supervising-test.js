import { setupTest } from 'ember-qunit';
import ENV from 'pix-certif/config/environment';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapters | certification-candidate-for-supervising', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:certification-candidate-for-supervising');
    adapter.ajax = sinon.stub();
  });

  module('#updateAuthorizedToStart', function () {
    test('should call API to /certification-candidates/:id/authorize-to-start', async function (assert) {
      // when
      await adapter.updateAuthorizedToStart({ candidateId: 123, authorizedToStart: true });

      // then
      assert.ok(
        adapter.ajax.calledWith(`${ENV.APP.API_HOST}/api/certification-candidates/123/authorize-to-start`, 'POST', {
          data: { 'authorized-to-start': true },
        }),
      );
    });
  });

  module('#authorizeTestResume', function () {
    test('should call API to /certification-candidates/:id/authorize-to-resume', async function (assert) {
      // when
      await adapter.authorizeTestResume({ candidateId: 123 });

      // then
      assert.ok(
        adapter.ajax.calledWith(`${ENV.APP.API_HOST}/api/certification-candidates/123/authorize-to-resume`, 'POST'),
      );
    });
  });

  module('when request type is endAssessmentByInvigilator', function () {
    test('should call API to /certification-candidates/:id/end-assessment-by-invigilator', async function (assert) {
      // when
      await adapter.endAssessmentByInvigilator({ candidateId: 123 });

      // then
      assert.ok(
        adapter.ajax.calledWith(
          `${ENV.APP.API_HOST}/api/certification-candidates/123/end-assessment-by-invigilator`,
          'PATCH',
        ),
      );
    });
  });
});
