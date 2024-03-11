/* eslint ember/no-classic-classes: 0 */
/* eslint ember/require-tagless-components: 0 */

import Service from '@ember/service';
import { setupTest } from 'ember-qunit';
import { module, test } from 'qunit';

import createGlimmerComponent from '../../helpers/create-glimmer-component';

module('Unit | Component | Navbar Mobile Header Component', function (hooks) {
  setupTest(hooks);
  const sessionStubResolve = Service.extend({ isAuthenticated: true });
  const sessionStubReject = Service.extend({ isAuthenticated: false });

  let component;

  module('When user is logged', function (hooks) {
    hooks.beforeEach(function () {
      this.owner.register('service:session', sessionStubResolve);
      component = createGlimmerComponent('navbar-mobile-header');
    });

    module('#isUserLogged', function () {
      test('should return true', function (assert) {
        // then
        assert.true(component.isUserLogged);
      });
    });
  });

  module('When user is not logged', function (hooks) {
    hooks.beforeEach(function () {
      this.owner.register('service:session', sessionStubReject);
      component = createGlimmerComponent('navbar-mobile-header');
    });

    module('#isUserLogged', function () {
      test('should return false, when user is unauthenticated', function (assert) {
        // then
        assert.false(component.isUserLogged);
      });
    });
  });
});
