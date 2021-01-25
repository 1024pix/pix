import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import Service from '@ember/service';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | user-logged-menu', function(hooks) {
  setupTest(hooks);

  class currentUserStub extends Service {
    organization = null;
  }

  let component;

  hooks.beforeEach(function() {
    component = createGlimmerComponent('component:user-logged-menu');
    this.owner.register('service:currentUser', currentUserStub);
  });

  module('action#toggleUserMenu', function() {
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

  module('organizationNameAndExternalId', function() {

    test('should return the organization name if the externalId is not defined', function(assert) {
      // given
      const expectedOrganizationName = 'expectedOrganizationName';
      this.owner.lookup('service:currentUser').set('organization', { name: expectedOrganizationName, externalId: null });

      // when
      const computedOrganizationName = component.organizationNameAndExternalId;

      // then
      assert.equal(computedOrganizationName, expectedOrganizationName);
    });

    test('should return the organization name and externalId if the externalId is defined', function(assert) {
      // given
      const expectedExternalId = 'expectedExternalId';
      const expectedOrganizationName = 'expectedOrganizationName';
      this.owner.lookup('service:currentUser').set('organization', { name: expectedOrganizationName, externalId: expectedExternalId });

      // when
      const computedOrganizationName = component.organizationNameAndExternalId;

      // then
      assert.equal(computedOrganizationName, `${expectedOrganizationName} (${expectedExternalId})`);
    });
  });
});
