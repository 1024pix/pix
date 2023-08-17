import { run } from '@ember/runloop';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

module('Unit | Model | prescriber', function (hooks) {
  setupTest(hooks);

  module('#hasCurrentOrganizationWithGARAsIdentityProvider', function () {
    test('it should return false if the current organization has not GAR as identity provider', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const organization = run(() => store.createRecord('organization', { name: 'Willow school' }));
      const userOrgaSettings = run(() => store.createRecord('userOrgaSetting', { organization }));
      const membership = run(() => store.createRecord('membership', { organizationRole: 'MEMBER', organization }));
      const memberships = [membership];
      const model = run(() => store.createRecord('prescriber', { memberships, userOrgaSettings }));

      // when / then
      assert.false(model.hasCurrentOrganizationWithGARAsIdentityProvider);
    });

    test('it should return true if the current organization has GAR as identity provider', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const organization = run(() =>
        store.createRecord('organization', {
          name: 'Willow school',
          identityProviderForCampaigns: 'GAR',
        }),
      );
      const userOrgaSettings = run(() => store.createRecord('userOrgaSetting', { organization }));
      const membership = run(() => store.createRecord('membership', { organizationRole: 'MEMBER', organization }));
      const memberships = [membership];
      const model = run(() => store.createRecord('prescriber', { memberships, userOrgaSettings }));

      // when / then
      assert.true(model.hasCurrentOrganizationWithGARAsIdentityProvider);
    });
  });

  module('#isAdminOfTheCurrentOrganization', function () {
    test('it should return true if prescriber is ADMIN of the current organization', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const organization = run(() => store.createRecord('organization', { name: 'Willow school' }));
      const userOrgaSettings = run(() => store.createRecord('userOrgaSetting', { organization }));
      const membership = run(() => store.createRecord('membership', { organizationRole: 'ADMIN', organization }));
      const memberships = [membership];
      const model = run(() => store.createRecord('prescriber', { memberships, userOrgaSettings }));

      // when / then
      assert.true(model.isAdminOfTheCurrentOrganization);
    });

    test('it should return false if prescriber is MEMBER of the current organization', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const organization = run(() => store.createRecord('organization', { name: 'Willow school' }));
      const userOrgaSettings = run(() => store.createRecord('userOrgaSetting', { organization }));
      const membership = run(() => store.createRecord('membership', { organizationRole: 'MEMBER', organization }));
      const memberships = [membership];
      const model = run(() => store.createRecord('prescriber', { memberships, userOrgaSettings }));

      // when / then
      assert.false(model.isAdminOfTheCurrentOrganization);
    });

    test('it should return false if prescriber is MEMBER of the current organization and ADMIN in another', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentOrganization = run(() => store.createRecord('organization', { id: 7, name: 'Willow school' }));
      const otherOrganization = run(() => store.createRecord('organization', { id: 123, name: 'Tanglewood school' }));
      const userOrgaSettings = run(() => store.createRecord('userOrgaSetting', { organization: currentOrganization }));
      const membership = run(() =>
        store.createRecord('membership', { organizationRole: 'MEMBER', currentOrganization }),
      );
      const membership2 = run(() => store.createRecord('membership', { organizationRole: 'ADMIN', otherOrganization }));
      const memberships = [membership, membership2];
      const model = run(() => store.createRecord('prescriber', { memberships, userOrgaSettings }));

      // when / then
      assert.false(model.isAdminOfTheCurrentOrganization);
    });
  });
});
