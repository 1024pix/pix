import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | organization', function (hooks) {
  setupTest(hooks);

  module('#archivedFormattedDate', function () {
    test('it formats the archived date', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = run(() => store.createRecord('organization', { archivedAt: new Date('2022-02-22') }));

      // when
      const archivedFormattedDate = model.archivedFormattedDate;

      // then
      assert.strictEqual(archivedFormattedDate, '22/02/2022');
    });
  });

  module('#createdAtFormattedDate', function () {
    test('it formats the organization creation date', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = run(() => store.createRecord('organization', { createdAt: new Date('2022-09-02') }));

      // when
      const createdAtFormattedDate = model.createdAtFormattedDate;

      // then
      assert.strictEqual(createdAtFormattedDate, '02/09/2022');
    });
  });

  module('#isArchived', function () {
    test('it return whether organization is archived', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = run(() => store.createRecord('organization', { archivistFullName: 'Anne Héantie' }));

      // when
      const isOrganizationArchived = model.isArchived;

      // then
      assert.true(isOrganizationArchived);
    });
  });
});
