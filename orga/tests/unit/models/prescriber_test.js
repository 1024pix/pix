import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Model | prescriber', function (hooks) {
  setupTest(hooks);

  module('#hasCurrentOrganizationWithGARAsIdentityProvider', function () {
    test('it should return false if the current organization has not GAR as identity provider', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const organization = store.createRecord('organization', { name: 'Willow school' });
      const userOrgaSettings = store.createRecord('userOrgaSetting', { organization });
      const membership = store.createRecord('membership', { organizationRole: 'MEMBER', organization });
      const memberships = [membership];
      const model = store.createRecord('prescriber', { memberships, userOrgaSettings });

      // when / then
      assert.false(model.hasCurrentOrganizationWithGARAsIdentityProvider);
    });

    test('it should return true if the current organization has GAR as identity provider', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const organization = store.createRecord('organization', {
        name: 'Willow school',
        identityProviderForCampaigns: 'GAR',
      });
      const userOrgaSettings = store.createRecord('userOrgaSetting', { organization });
      const membership = store.createRecord('membership', { organizationRole: 'MEMBER', organization });
      const memberships = [membership];
      const model = store.createRecord('prescriber', { memberships, userOrgaSettings });

      // when / then
      assert.true(model.hasCurrentOrganizationWithGARAsIdentityProvider);
    });
  });

  module('#isAdminOfTheCurrentOrganization', function () {
    test('it should return true if prescriber is ADMIN of the current organization', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const organization = store.createRecord('organization', { name: 'Willow school' });
      const userOrgaSettings = store.createRecord('userOrgaSetting', { organization });
      const membership = store.createRecord('membership', { organizationRole: 'ADMIN', organization });
      const memberships = [membership];
      const model = store.createRecord('prescriber', { memberships, userOrgaSettings });

      // when / then
      assert.true(model.isAdminOfTheCurrentOrganization);
    });

    test('it should return false if prescriber is MEMBER of the current organization', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const organization = store.createRecord('organization', { name: 'Willow school' });
      const userOrgaSettings = store.createRecord('userOrgaSetting', { organization });
      const membership = store.createRecord('membership', { organizationRole: 'MEMBER', organization });
      const memberships = [membership];
      const model = store.createRecord('prescriber', { memberships, userOrgaSettings });

      // when / then
      assert.false(model.isAdminOfTheCurrentOrganization);
    });

    test('it should return false if prescriber is MEMBER of the current organization and ADMIN in another', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const currentOrganization = store.createRecord('organization', { id: 7, name: 'Willow school' });
      const otherOrganization = store.createRecord('organization', { id: 123, name: 'Tanglewood school' });
      const userOrgaSettings = store.createRecord('userOrgaSetting', { organization: currentOrganization });
      const membership = store.createRecord('membership', { organizationRole: 'MEMBER', currentOrganization });
      const membership2 = store.createRecord('membership', { organizationRole: 'ADMIN', otherOrganization });
      const memberships = [membership, membership2];
      const model = store.createRecord('prescriber', { memberships, userOrgaSettings });

      // when / then
      assert.false(model.isAdminOfTheCurrentOrganization);
    });
  });

  module('#enableMultipleSendingAssessment', function () {
    test('it returns true when feature is enabled', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('prescriber', {
        features: { ['MULTIPLE_SENDING_ASSESSMENT']: true },
      });
      // when
      const enableMultipleSendingAssessment = model.enableMultipleSendingAssessment;

      // then
      assert.true(enableMultipleSendingAssessment);
    });

    test('it returns false when feature is disabled', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('prescriber', {
        features: { ['MULTIPLE_SENDING_ASSESSMENT']: false },
      });
      // when
      const enableMultipleSendingAssessment = model.enableMultipleSendingAssessment;

      // then
      assert.false(enableMultipleSendingAssessment);
    });
  });

  module('#computeOrganizationLearnerCertificability', function () {
    test('it returns true when feature is enabled', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('prescriber', {
        features: { ['COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY']: true },
      });
      // when
      const computeOrganizationLearnerCertificability = model.computeOrganizationLearnerCertificability;

      // then
      assert.true(computeOrganizationLearnerCertificability);
    });

    test('it returns false when feature is disabled', function (assert) {
      // given
      const store = this.owner.lookup('service:store');
      const model = store.createRecord('prescriber', {
        features: { ['COMPUTE_ORGANIZATION_LEARNER_CERTIFICABILITY']: false },
      });
      // when
      const computeOrganizationLearnerCertificability = model.computeOrganizationLearnerCertificability;

      // then
      assert.false(computeOrganizationLearnerCertificability);
    });
  });
});
