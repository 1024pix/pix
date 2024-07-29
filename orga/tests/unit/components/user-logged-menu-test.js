import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | user-logged-menu', (hooks) => {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:layout/user-logged-menu');
  });

  module('action#toggleUserMenu', () => {
    test('should return false as default value', function (assert) {
      // then
      assert.false(component.isMenuOpen);
    });

    test('should return true, when user details is clicked', async function (assert) {
      // when
      await component.toggleUserMenu();
      // then
      assert.true(component.isMenuOpen);
    });

    test('should return false, when isMenuOpen was previously true', async function (assert) {
      // when
      await component.toggleUserMenu();
      await component.toggleUserMenu();
      // then
      assert.false(component.isMenuOpen);
    });
  });

  module('organizationNameAndExternalId', () => {
    test('should return the organization name if the externalId is not defined', function (assert) {
      // given
      const expectedOrganizationName = 'expectedOrganizationName';
      const currentUser = { organization: { name: expectedOrganizationName } };
      component.currentUser = currentUser;

      // when
      const computedOrganizationName = component.organizationNameAndExternalId;
      // then
      assert.strictEqual(computedOrganizationName, expectedOrganizationName);
    });

    test('should return the organization name and externalId if the externalId is defined', function (assert) {
      // given
      const expectedOrganizationName = 'expectedOrganizationName';
      const expectedExternalId = 'expectedExternalId';
      const currentUser = { organization: { name: expectedOrganizationName, externalId: expectedExternalId } };
      component.currentUser = currentUser;

      // when
      const computedOrganizationName = component.organizationNameAndExternalId;
      // then
      assert.strictEqual(computedOrganizationName, `${expectedOrganizationName} (${expectedExternalId})`);
    });
  });
});
