import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';
import { resolve } from 'rsvp';

module('Unit | Adapter | student', function (hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function () {
    adapter = this.owner.lookup('adapter:student');
    const ajaxStub = () => resolve();
    adapter.ajax = ajaxStub;
  });

  module('#urlForFindAll', function () {
    test('should build query url from student id', async function (assert) {
      // given
      const certificationCenterId = 1;
      const sessionId = 3;
      const query = {
        page: {
          number: 1,
          size: 1,
        },
        filter: {
          certificationCenterId,
          sessionId,
        },
      };

      // when
      const url = await adapter.urlForQuery(query);

      // then
      assert.true(url.endsWith(`certification-centers/${certificationCenterId}/sessions/${sessionId}/students`));
    });
  });
});
