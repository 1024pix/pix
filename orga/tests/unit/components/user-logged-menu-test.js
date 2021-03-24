import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | user-logged-menu', (hooks) => {

  setupTest(hooks);

  let component;

  hooks.beforeEach(() => {
    component = createGlimmerComponent('component:user-logged-menu');
  });

  module('action#toggleUserMenu', () => {
    test('should return false as default value', function(assert) {
      // then
      assert.equal(component.isMenuOpen, false);
    });

    test('should return true, when user details is clicked', async function(assert) {
      // when
      await component.toggleUserMenu();
      // then
      assert.equal(component.isMenuOpen, true);
    });

    test('should return false, when isMenuOpen was previously true', async function(assert) {
      // when
      await component.toggleUserMenu();
      await component.toggleUserMenu();
      // then
      assert.equal(component.isMenuOpen, false);
    });
  });

  module('organizationNameAndExternalId', () => {

    test('should return the organization name if the externalId is not defined', (assert) => {
      // given
      const expectedOrganizationName = 'expectedOrganizationName';
      const currentUser = { organization: { name: expectedOrganizationName } };
      component.currentUser = currentUser;

      // when
      const computedOrganizationName = component.organizationNameAndExternalId;
      // then
      assert.equal(computedOrganizationName, expectedOrganizationName);
    });

    test('should return the organization name and externalId if the externalId is defined', (assert) => {
      // given
      const expectedOrganizationName = 'expectedOrganizationName';
      const expectedExternalId = 'expectedExternalId';
      const currentUser = { organization: { name: expectedOrganizationName, externalId: expectedExternalId } };
      component.currentUser = currentUser;

      // when
      const computedOrganizationName = component.organizationNameAndExternalId;
      // then
      assert.equal(computedOrganizationName, `${expectedOrganizationName} (${expectedExternalId})`);
    });
  });
});
