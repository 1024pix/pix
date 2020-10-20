import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { resolve } from 'rsvp';

module('Unit | Adapter | student', function(hooks) {
  setupTest(hooks);

  let adapter;

  hooks.beforeEach(function() {
    adapter = this.owner.lookup('adapter:student');
    const ajaxStub = () => resolve();
    adapter.ajax = ajaxStub;
  });

  module('#urlForFindAll', function() {

    test('should build query url from student id', async function(assert) {
      // given
      const certificationCenterId = 1;
      const adapterOptions = { certificationCenterId };

      // when
      const url = await adapter.urlForFindAll(undefined, { adapterOptions });

      // then
      assert.equal(url.endsWith(`certification-centers/${certificationCenterId}/students`), true);
    });
  });
});
