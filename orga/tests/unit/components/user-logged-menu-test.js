import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';

module('Unit | Component | user-logged-menu', (hooks) => {

  setupTest(hooks);

  let component;

  hooks.beforeEach(function() {
    component = this.owner.factoryFor('component:user-logged-menu').create();
  });

  module('action#toggleUserMenu', () => {
    test('should return true, when user details is clicked', function(assert) {
      // when
      component.send('toggleUserMenu');
      // then
      assert.equal(component.get('isMenuOpen'), true);
    });

    test('should return false as default value', function(assert) {
      // then
      assert.equal(component.get('isMenuOpen'), false);
    });

    test('should return false, when isMenuOpen was previously true', function(assert) {
      // when
      component.send('toggleUserMenu');
      component.send('toggleUserMenu');
      // then
      assert.equal(component.get('isMenuOpen'), false);
    });
  });
});
