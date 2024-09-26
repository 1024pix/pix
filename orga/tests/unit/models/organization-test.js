import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | organization', function (hooks) {
  setupTest(hooks);

  module('#isScoAndManagingStudents', function () {
    test("it returns true when organization has 'SCO' type and isManagingStudents at true", function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      // when
      const organization = store.createRecord('organization', {
        isManagingStudents: true,
        type: 'SCO',
      });

      // then
      assert.true(organization.isScoAndManagingStudents);
    });

    test("it returns false when organization does not have 'SCO' type or isManagingStudents at true", function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      // when
      const organization = store.createRecord('organization', {
        isManagingStudents: false,
        type: 'PRO',
      });

      // then
      assert.false(organization.isScoAndManagingStudents);
    });
  });
  module('#hasGarIdentityProvider', function () {
    test("it returns true when organization isScoAndManagingStudents and identityProviderForCampaigns 'GAR'", function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      // when
      const organization = store.createRecord('organization', {
        isManagingStudents: true,
        type: 'SCO',
        identityProviderForCampaigns: 'GAR',
      });

      // then
      assert.true(organization.hasGarIdentityProvider);
    });

    test("it returns false when organization does not have isScoAndManagingStudents or identityProviderForCampaigns 'GAR'", function (assert) {
      // given
      const store = this.owner.lookup('service:store');

      // when
      const organization = store.createRecord('organization', {
        isManagingStudents: true,
        type: 'SCO',
        identityProviderForCampaigns: 'TEST',
      });

      // then
      assert.false(organization.hasGarIdentityProvider);
    });
  });
});
