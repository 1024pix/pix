import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | user-logged-menu', (hooks) => {

  setupTest(hooks);

  let component;

  hooks.beforeEach(function() {
    component = this.owner.factoryFor('component:user-logged-menu').create();
  });

  module('action#toggleUserMenu', () => {
    test('should return false as default value', function(assert) {
      // then
      assert.equal(component.get('isMenuOpen'), false);
    });

    test('should return true, when user details is clicked', function(assert) {
      // when
      component.send('toggleUserMenu');
      // then
      assert.equal(component.get('isMenuOpen'), true);
    });

    test('should return false, when isMenuOpen was previously true', function(assert) {
      // when
      component.send('toggleUserMenu');
      component.send('toggleUserMenu');
      // then
      assert.equal(component.get('isMenuOpen'), false);
    });
  });

  module('organizationNameAndExternalId', () => {

    test('should return the organization name if the externalId is not defined', (assert) => {
      // given
      const expectedOrganizationName = 'expectedOrganizationName';
      const currentUser = { organization: { name: expectedOrganizationName } };
      component.set('currentUser', currentUser);

      // when
      const computedOrganizationName = component.get('organizationNameAndExternalId');
      // then
      assert.equal(computedOrganizationName, expectedOrganizationName);
    });

    test('should return the organization name and externalId if the externalId is defined', (assert) => {
      // given
      const expectedOrganizationName = 'expectedOrganizationName';
      const expectedExternalId = 'expectedExternalId';
      const currentUser = { organization: { name: expectedOrganizationName, externalId: expectedExternalId } };
      component.set('currentUser', currentUser);

      // when
      const computedOrganizationName = component.get('organizationNameAndExternalId');
      // then
      assert.equal(computedOrganizationName, `${expectedOrganizationName} (${expectedExternalId})`);
    });
  });
});
