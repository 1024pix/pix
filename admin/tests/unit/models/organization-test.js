import { setupTest } from 'ember-qunit';
import setupIntl from 'pix-admin/tests/helpers/setup-intl';
import { module, test } from 'qunit';

module('Unit | Model | organization', function (hooks) {
  setupTest(hooks);
  setupIntl(hooks);

  module('#archivedFormattedDate', function () {
    test('it formats the archived date', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('organization', { archivedAt: new Date('2022-02-22') });

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
      const model = store.createRecord('organization', { createdAt: new Date('2022-09-02') });

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
      const model = store.createRecord('organization', { archivedAt: '2022-12-25', archivistFullName: 'Anne Héantie' });

      // when
      const isOrganizationArchived = model.isArchived;

      // then
      assert.true(isOrganizationArchived);
    });
  });

  module('#isCreditsManagementEnabled', function () {
    test('it returns true when the feature is active', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('organization', { features: { CREDITS_MANAGEMENT: { active: true } } });

      // when & then
      assert.true(model.isCreditsManagementEnabled);
    });

    test('it returns false when the feature is inactive', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('organization', { features: { CREDITS_MANAGEMENT: { active: false } } });

      // when & then
      assert.false(model.isCreditsManagementEnabled);
    });

    test('it returns false when the feature is unknown', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('organization', { features: {} });

      // when & then
      assert.false(model.isCreditsManagementEnabled);
    });
  });

  module('#dataProtectionOfficerFullName', function () {
    test('it returns the data protection officer full name', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('organization', {
        dataProtectionOfficerFirstName: 'Justin',
        dataProtectionOfficerLastName: 'Ptipeu',
        dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
      });

      // when & then
      assert.strictEqual(model.dataProtectionOfficerFullName, 'Justin Ptipeu');
    });

    test('it returns the data protection officer full name with partial information', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('organization', {
        dataProtectionOfficerLastName: 'Ptipeu',
        dataProtectionOfficerEmail: 'justin.ptipeu@example.net',
      });

      // when & then
      assert.strictEqual(model.dataProtectionOfficerFullName, 'Ptipeu');
    });
  });
});
