import Service from '@ember/service';
import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | User logged Menu', function (hooks) {
  setupTest(hooks);
  let component;

  hooks.beforeEach(function () {
    component = createGlimmerComponent('component:user-logged-menu');
  });

  module('#toggleUserMenu', function () {
    test('should return true, when user details is clicked', function (assert) {
      // given
      component.canDisplayMenu = false;

      // when
      component.toggleUserMenu();

      // then
      assert.true(component.canDisplayMenu);
    });

    test('should return false, when canDisplayMenu was previously true', function (assert) {
      // given
      component.canDisplayMenu = true;

      // when
      component.toggleUserMenu();

      // then
      assert.false(component.canDisplayMenu);
    });
  });

  module('displayedIdentifier', function () {
    test("should return user's email if not undefined", function (assert) {
      // given
      component.currentUser = Service.create({
        user: {
          email: 'email@example.net',
        },
      });

      // then
      assert.strictEqual(component.displayedIdentifier, 'email@example.net');
    });

    test("should return user's username if not undefined and no email defined", function (assert) {
      // given
      component.currentUser = Service.create({
        user: {
          username: 'my username',
        },
      });

      // then
      assert.strictEqual(component.displayedIdentifier, 'my username');
    });

    test("should return user's email if email and username are defined", function (assert) {
      // given
      component.currentUser = Service.create({
        user: {
          email: 'email@example.net',
          username: 'my username',
        },
      });

      // then
      assert.strictEqual(component.displayedIdentifier, 'email@example.net');
    });

    test('should return undefined if no email or username are defined', function (assert) {
      // given
      component.currentUser = Service.create({
        user: {},
      });

      // then
      assert.strictEqual(component.displayedIdentifier, undefined);
    });
  });
});
