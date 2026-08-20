import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import sinon from 'sinon';

module('Unit | Adapter | certification issue report', function (hooks) {
  setupTest(hooks);

  module('#abort', function () {
    test('calls certification center invitation abort url', async function (assert) {
      // given
      const adapter = this.owner.lookup('adapter:certification-report');
      sinon.stub(adapter, 'ajax');

      const certificationCourseId = 1;
      const reason = 'technical';

      // when
      await adapter.abort({ certificationCourseId, reason });

      // then
      const expectedUrl = 'http://localhost:3000/api/certification-reports/1/abort';
      assert.true(adapter.ajax.calledOnceWithExactly(expectedUrl, 'POST', { data: { data: { reason: 'technical' } } }));
    });
  });
});
