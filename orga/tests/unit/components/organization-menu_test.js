import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | organization-menu', (hooks) => {
  setupTest(hooks);

  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:layout/organization-menu');
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

  module('organizationName', () => {
    test('should return the organization name', function (assert) {
      // given
      const expectedOrganizationName = 'expectedOrganizationName';
      const currentUser = { organization: { name: expectedOrganizationName } };
      component.currentUser = currentUser;

      // when
      const computedOrganizationName = component.organizationName;
      // then
      assert.strictEqual(computedOrganizationName, expectedOrganizationName);
    });
  });
});
