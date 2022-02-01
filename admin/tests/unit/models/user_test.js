import { module, test } from 'qunit';
import { setupTest } from 'ember-qunit';
import { run } from '@ember/runloop';

module('Unit | Model | user', function (hooks) {
  setupTest(hooks);

  let store;

  hooks.beforeEach(async function () {
    store = this.owner.lookup('service:store');
  });

  module('#fullName', function () {
    test('it should return the fullname, combination of last and first name', function (assert) {
      // given
      const user = run(() => {
        return store.createRecord('user', { firstName: 'Jean-Baptiste', lastName: 'Poquelin' });
      });

      // when
      const fullName = user.fullName;

      // then
      // TODO: Fix this the next time the file is edited.
      // eslint-disable-next-line qunit/no-assert-equal
      assert.equal(fullName, 'Jean-Baptiste Poquelin');
    });
  });

  module('pix authentication method', function () {
    module('#hasPixAuthenticationMethod', function () {
      test('it should return true when user has a pix authentication method', function (assert) {
        // given
        const authenticationMethod = store.createRecord('authentication-method', { identityProvider: 'PIX' });
        const user = store.createRecord('user', {
          email: 'john.doe@example.net',
          authenticationMethods: [authenticationMethod],
        });

        // then
        assert.true(user.hasPixAuthenticationMethod);
      });

      test('it should return false when user has an other authentication method', function (assert) {
        // given
        const authenticationMethod = store.createRecord('authentication-method', { identityProvider: 'GAR' });
        const user = store.createRecord('user', {
          email: 'john.doe@example.net',
          authenticationMethods: [authenticationMethod],
        });

        // then
        assert.false(user.hasPixAuthenticationMethod);
      });
    });

    module('#hasEmailAuthenticationMethod', function () {
      test('it should return true when email is defined and user has pix authentication method', function (assert) {
        // given
        const authenticationMethod = store.createRecord('authentication-method', { identityProvider: 'PIX' });
        const user = store.createRecord('user', {
          email: 'john.doe@example.net',
          authenticationMethods: [authenticationMethod],
        });

        // then
        assert.true(user.hasEmailAuthenticationMethod);
      });
    });

    module('#hasUsernameAuthenticationMethod', function () {
      test('it should return true when username is defined and user has pix authentication method', function (assert) {
        // given
        const authenticationMethod = store.createRecord('authentication-method', { identityProvider: 'PIX' });
        const user = store.createRecord('user', {
          username: 'john.doe0101',
          authenticationMethods: [authenticationMethod],
        });

        // then
        assert.true(user.hasUsernameAuthenticationMethod);
      });
    });
  });

  module('#hasPoleEmploiAuthenticationMethod', function () {
    test('it should return true when user has Pole Emploi authentication method', function (assert) {
      // given
      const authenticationMethod = store.createRecord('authentication-method', { identityProvider: 'POLE_EMPLOI' });
      const user = store.createRecord('user', { authenticationMethods: [authenticationMethod] });

      // then
      assert.true(user.hasPoleEmploiAuthenticationMethod);
    });
  });

  module('#hasGarAuthenticationMethod', function () {
    test('it should return true when user has GAR authentication method', function (assert) {
      // given
      const authenticationMethod = store.createRecord('authentication-method', { identityProvider: 'GAR' });
      const user = store.createRecord('user', { authenticationMethods: [authenticationMethod] });

      // then
      assert.true(user.hasGarAuthenticationMethod);
    });
  });

  module('hasOnlyOneAuthenticationMethod', function () {
    test('it should return true when user has only one authentication method', function (assert) {
      // given
      const authenticationMethod = store.createRecord('authentication-method', { identityProvider: 'GAR' });
      const user = store.createRecord('user', { authenticationMethods: [authenticationMethod] });

      // then
      assert.true(user.hasOnlyOneAuthenticationMethod);
    });

    test('it should return false when user has more than one authentication method', function (assert) {
      // given
      const garAuthenticationMethod = store.createRecord('authentication-method', { identityProvider: 'GAR' });
      const poleEmploiAuthenticationMethod = store.createRecord('authentication-method', {
        identityProvider: 'POLE_EMPLOI',
      });
      const user = store.createRecord('user', {
        authenticationMethods: [garAuthenticationMethod, poleEmploiAuthenticationMethod],
      });

      // then
      assert.false(user.hasOnlyOneAuthenticationMethod);
    });
  });
});
